import Bluebird from 'bluebird';
import { NextFunction, Request, Response } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { IOpenAIService } from '../../../services/open-ai.service';
import { IConversationService } from '../../../services/conversation.service';
import validateCreateNewConversationParams from '../../../validators/validate-create-new-conversation-input-params';
import validateStackMessageToConversationParams from '../../../validators/validate-stack-message-to-conversation-input-params';

export interface IConversationController {
  createConversation: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
  stackMessageToConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}

interface ConversationControllerConstructorParams {
  openAIService: IOpenAIService;
  conversationService: IConversationService;
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
}

export default class OpenAIController implements IConversationController {
  private readonly openAIService: IOpenAIService;

  private readonly logger: loggerInterfaces.ILogger;

  private readonly conversationService: IConversationService;

  constructor({
    loggerHandler,
    openAIService,
    conversationService,
  }: ConversationControllerConstructorParams) {
    this.openAIService = openAIService;
    this.conversationService = conversationService;
    this.logger = loggerHandler('OpenAIController');
  }

  async createConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve(req.body)
      .tap(() => this.logger.logInfo('createConversation'))
      .then(validateCreateNewConversationParams)
      .then(
        this.conversationService.createConversation.bind(
          this.conversationService,
        ),
      )
      .then(res.status(201).send.bind(res))
      .catch(next);
  }

  async stackMessageToConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve(req.body)
      .tap(() => this.logger.logInfo('stackMessageToConversation'))
      .then(validateStackMessageToConversationParams)
      .then(
        this.conversationService.parseConversationChunkParams.bind(
          this.conversationService,
        ),
      )
      .then(
        this.conversationService.createConversationChunk.bind(
          this.conversationService,
        ),
      )
      .then(res.status(201).send.bind(res))
      .catch(next);
  }
}
