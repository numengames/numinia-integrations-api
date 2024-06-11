import Bluebird from 'bluebird';
import { NextFunction, Request, Response } from 'express';
import { types as modelTypes } from '@numengames/numinia-models';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { IUserService } from '../../../services/user.service';
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
  getConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void>;
}

interface ConversationControllerConstructorParams {
  userService: IUserService;
  conversationService: IConversationService;
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
}

export default class OpenAIController implements IConversationController {
  private readonly userService: IUserService;

  private readonly logger: loggerInterfaces.ILogger;

  private readonly conversationService: IConversationService;

  constructor({
    userService,
    loggerHandler,
    conversationService,
  }: ConversationControllerConstructorParams) {
    this.userService = userService;
    this.conversationService = conversationService;
    this.logger = loggerHandler('OpenAIController');
  }

  private async handleCreateConversation(
    conversationParams: Record<string, unknown>,
  ): Promise<void> {
    const userDocument = await this.userService.getUserFromWalletId(
      conversationParams.walletId as string,
    );

    await this.conversationService.createConversation({
      ...(conversationParams as Partial<modelTypes.ConversationDocument>),
      ...(userDocument ? { user: userDocument._id } : {}),
    });
  }

  async createConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve(req.body)
      .tap(() => this.logger.logInfo('createConversation'))
      .then(validateCreateNewConversationParams)
      .then(this.handleCreateConversation.bind(this))
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

  async getConversation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Bluebird.resolve(req.params.conversationId)
      .tap(() => this.logger.logInfo('getConversation'))
      .then(
        this.conversationService.getConversationByConversationIdLean.bind(
          this.conversationService,
        ),
      )
      .then(res.status(200).send.bind(res))
      .catch(next);
  }
}
