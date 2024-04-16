import { Router } from 'express';

import { openAIService } from '../../services';
import { ILogger } from '../../../utils/logger';
import OpenAIController, { IOpenAIController } from '../controllers/openai.controller';

export default class OpenAIRoutes {
  router: Router;

  private openAIController: IOpenAIController;

  constructor(logger: (title: string) => ILogger) {
    this.router = Router();
  
    this.openAIController = new OpenAIController({ logger, openAIService });

    this.routes();
  }

  routes(): void {
    this.router.post('/send-text-message', this.openAIController.sendTextMessage.bind(this.openAIController));
    this.router.post('/assistant/send-text-message', this.openAIController.assistantSendTextMessage.bind(this.openAIController));
  }
}