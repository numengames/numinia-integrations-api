import { Request, Response } from 'express';

import logger from '../../../utils/logger';

export default class DiscordController {
  private log = logger('DiscordController');

  sendWebhook(req: Request, res: Response) {
    const { season, scapeRoomName, walletId } = req.body;
    this.log.logInfo(`An user enter the scaperoom: ${scapeRoomName} as a user with walletId: ${walletId} (season ${season})`, { level: 'info', discord: true });

    res.status(204).send();
  }
}