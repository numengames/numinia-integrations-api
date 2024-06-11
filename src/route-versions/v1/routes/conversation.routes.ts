import { Router } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import ConversationController, {
  IConversationController,
} from '../controllers/conversation.controller';
import { userService, conversationService } from '../../../services';

export default class ConversationRoutes {
  router: Router;

  private conversationController: IConversationController;

  constructor(loggerHandler: (title: string) => loggerInterfaces.ILogger) {
    this.router = Router();

    this.conversationController = new ConversationController({
      userService,
      loggerHandler,
      conversationService,
    });

    this.routes();
  }

  routes(): void {
    this.router.post(
      '/',
      this.conversationController.createConversation.bind(
        this.conversationController,
      ),
    );
    this.router.post(
      '/message',
      this.conversationController.stackMessageToConversation.bind(
        this.conversationController,
      ),
    );
    this.router.get(
      '/:conversationId',
      this.conversationController.getConversation.bind(
        this.conversationController,
      ),
    );
  }
}
