import { Router } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import OpenAIController, {
  IOpenAIController,
} from '../controllers/openai.controller';
import { openAIService } from '../../../services';

export default class OpenAIRoutes {
  router: Router;

  private openAIController: IOpenAIController;

  constructor(loggerHandler: (title: string) => loggerInterfaces.ILogger) {
    this.router = Router();

    this.openAIController = new OpenAIController({
      loggerHandler,
      openAIService,
    });

    this.routes();
  }

  routes(): void {
    this.router.post(
      '/send-text-message',
      this.openAIController.sendTextMessage.bind(this.openAIController),
    );
    this.router.post(
      '/assistant/send-text-message',
      this.openAIController.assistantSendTextMessage.bind(
        this.openAIController,
      ),
    );
  }
}
