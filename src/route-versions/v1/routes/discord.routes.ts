import { Router } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import DiscordController, {
  IDiscordController,
} from '../controllers/discord.controller';

export default class DiscordRoutes {
  router: Router;

  discordController: IDiscordController;

  constructor(loggerHandler: (title: string) => loggerInterfaces.ILogger) {
    this.router = Router();

    this.discordController = new DiscordController({ loggerHandler });

    this.routes();
  }

  routes() {
    this.router.post(
      '/sendWebHook',
      this.discordController.sendWebhook.bind(this.discordController),
    );
  }
}
