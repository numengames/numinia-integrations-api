import { NextFunction, Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';
import validateDiscordSendWebhookInputParams from '../../../validators/validate-discord-send-webhook-input-params';

export interface IDiscordController {
  sendWebhook: (req: Request, res: Response, next: NextFunction) => void
}

type TDiscordControllerParams = {
  logger: (title: string) => ILogger
}

export default class DiscordController implements IDiscordController {
  private _log;

  constructor({ logger }: TDiscordControllerParams) {
    this._log = logger('DiscordController');
  }

  sendWebhook(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(req.body)
      .then(validateDiscordSendWebhookInputParams)
      .tap(({ season, spaceUrl, spaceName, walletId, userName }) => this._log.logInfo(`An user enter the space: ${spaceName} with a url: ${spaceUrl} as a user with walletId: ${walletId}, userName: ${userName} (season ${season})`, { level: 'info', discord: true }))
      .then(res.status(204).send.bind(res))
      .catch(next);
  }
}