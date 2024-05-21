import { Router } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import OpenAIController, {
  IOpenAIController,
} from '../controllers/openai.controller';
import { openAIService, conversationService } from '../../../services';

export default class OpenAIRoutes {
  router: Router;

  private openAIController: IOpenAIController;

  constructor(loggerHandler: (title: string) => loggerInterfaces.ILogger) {
    this.router = Router();

    this.openAIController = new OpenAIController({
      loggerHandler,
      openAIService,
      conversationService,
    });

    this.routes();
  }

  routes(): void {
    this.router.post(
      '/conversation/text/:conversationId',
      this.openAIController.handleTextConversation.bind(this.openAIController),
    );
    this.router.post(
      '/conversation/assistant/text/:conversationId',
      this.openAIController.handleAssistantTextConversation.bind(
        this.openAIController,
      ),
    );
  }
}
