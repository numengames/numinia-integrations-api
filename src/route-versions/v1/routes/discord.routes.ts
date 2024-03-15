import { Router } from 'express';

import DiscordController from '../controllers/discord.controller';

export default class DiscordRoutes {
  router: Router;

  discordController = new DiscordController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.post('/sendWebHook', this.discordController.sendWebhook.bind(this.discordController));
  }
}