import Bluebird from 'bluebird';
import {
  constants as modelConstants,
  interfaces as modelInterfaces,
} from '@numengames/numinia-models';
import { NextFunction, Request, Response } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { roles } from '../../../config/openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import { IOpenAIService } from '../../../services/open-ai.service';
import { IConversationService } from '../../../services/conversation.service';
import validateOpenaiHandleTextConversationInputParams from '../../../validators/validate-openai-handle-text-conversation-input-params';

export interface IOpenAIController {
  handleTextConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
  handleAssistantTextConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}

type TOpenAIParams = {
  openAIService: IOpenAIService;
  conversationService: IConversationService;
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
};

export default class OpenAIController implements IOpenAIController {
  private readonly logger: loggerInterfaces.ILogger;

  private readonly openAIService: IOpenAIService;

  private readonly conversationService: IConversationService;

  constructor({
    loggerHandler,
    openAIService,
    conversationService,
  }: TOpenAIParams) {
    this.openAIService = openAIService;
    this.conversationService = conversationService;
    this.logger = loggerHandler('OpenAIController');
  }

  private manageTextResponse(res: Response, text?: string) {
    if (text !== undefined) {
      res.write(text);
    }
  }

  // private _manageAudioResponse(buffer: Buffer, res: Response) {
  //   res.setHeader('Content-Type', 'audio/mpeg');
  //   res.send(buffer);
  // }

  private async textConversationHandler(
    res: Response,
    inputParams: Record<string, unknown>,
  ) {
    const callback = (text?: string) => {
      this.manageTextResponse(res, text);
    };

    const conversationChunkList =
      await this.conversationService.getConversationChunkListLean(
        inputParams.conversationId as string,
      );

    const parsedConversationChunkList = conversationChunkList.map(
      (conversationChunk: modelInterfaces.ConversationChunkAttributes) => ({
        role: conversationChunk.role,
        content: conversationChunk.value,
      }),
    ) as ChatCompletionMessageParam[];

    const parsedMessage: ChatCompletionMessageParam = {
      role: roles[inputParams.role as string] as any,
      content: inputParams.message as string,
    };

    const messageList: ChatCompletionMessageParam[] = [
      ...parsedConversationChunkList,
      parsedMessage,
    ];

    const aiResponse = await this.openAIService.handleTextConversation({
      callback,
      messageList,
      params: inputParams,
    });

    await this.conversationService.createConversationChunk({
      value: inputParams.message as string,
      role: roles[inputParams.role as string],
      format: modelConstants.ConversationChunkFormat.TEXT,
      conversationId: inputParams.conversationId as string,
    });

    await this.conversationService.createConversationChunk({
      ...aiResponse,
      format: modelConstants.ConversationChunkFormat.TEXT,
      conversationId: inputParams.conversationId as string,
    });
  }

  private async assistantTextConversationHandler(
    res: Response,
    inputParams: Record<string, unknown>,
  ) {
    const callback = (text?: string) => {
      this.manageTextResponse(res, text);
    };

    const conversationLeanDocument =
      await this.conversationService.getConversationByConversationIdLean(
        inputParams.conversationId as string,
      );

    const conversationChunkList =
      await this.conversationService.getConversationChunkListLean(
        inputParams.conversationId as string,
      );

    const parsedConversationChunkList = conversationChunkList.map(
      (conversationChunk: modelInterfaces.ConversationChunkAttributes) => ({
        role: conversationChunk.role,
        content: conversationChunk.value,
      }),
    ) as ChatCompletionMessageParam[];

    const parsedMessage: ChatCompletionMessageParam = {
      role: roles[inputParams.role as string] as any,
      content: inputParams.message as string,
    };

    const messageList: ChatCompletionMessageParam[] = [
      ...parsedConversationChunkList,
      parsedMessage,
    ];

    const aiResponse = await this.openAIService.handleAssistantTextConversation(
      {
        callback,
        messageList,
        params: {
          ...inputParams,
          assistant: conversationLeanDocument.assistant,
        },
      },
    );

    await this.conversationService.createConversationChunk({
      value: inputParams.message as string,
      role: roles[inputParams.role as string],
      format: modelConstants.ConversationChunkFormat.TEXT,
      conversationId: inputParams.conversationId as string,
    });

    await this.conversationService.createConversationChunk({
      ...aiResponse,
      format: modelConstants.ConversationChunkFormat.TEXT,
      conversationId: inputParams.conversationId as string,
    });

    if (!inputParams.isStreamResponse) {
      return aiResponse;
    }
  }

  async handleTextConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve({ body: req.body, params: req.params })
      .tap(() => this.logger.logInfo('handleTextConversation'))
      .then(validateOpenaiHandleTextConversationInputParams)
      .then(this.textConversationHandler.bind(this, res))
      .then(() => res.end())
      .catch(next);
  }

  async handleAssistantTextConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve({ body: req.body, params: req.params })
      .tap(() => this.logger.logInfo('handleAssistantTextConversation'))
      .then(validateOpenaiHandleTextConversationInputParams)
      .then(this.assistantTextConversationHandler.bind(this, res))
      .then(
        (response) => (response && res.status(200).send(response)) || res.end(),
      )
      .catch((error: unknown) => {
        next(error);
      });
  }
}
