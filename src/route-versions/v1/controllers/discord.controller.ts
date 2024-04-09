import { Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';
export default class DiscordController {
  private _log;

  constructor(logger: (title: string) => ILogger) {
    this._log = logger('DiscordController');
  }

  sendWebhook(req: Request, res: Response) {
    const { season, spaceUrl, spaceName, walletId, userName } = req.body;
    this._log.logInfo(`An user enter the space: ${spaceName} with a url: ${spaceUrl} as a user with walletId: ${walletId}, userName: ${userName} (season ${season})`, { level: 'info', discord: true });

    res.status(204).send();
  }
}