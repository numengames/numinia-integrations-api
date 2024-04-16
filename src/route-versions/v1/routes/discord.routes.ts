import { Router } from 'express';

import { ILogger } from '../../../utils/logger';
import DiscordController, { IDiscordController } from '../controllers/discord.controller';

export default class DiscordRoutes {
  router: Router;

  discordController: IDiscordController;
  
  constructor(logger: (title: string) => ILogger) {
    this.router = Router();

    this.discordController = new DiscordController({ logger });

    this.routes();
  }

  routes() {
    this.router.post('/sendWebHook', this.discordController.sendWebhook.bind(this.discordController));
  }
}