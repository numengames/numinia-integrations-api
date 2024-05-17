import { NextFunction, Request, Response } from 'express';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import validateDiscordSendWebhookInputParams from '../../../validators/validate-discord-send-webhook-input-params';

export interface IDiscordController {
  sendWebhook: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<void>;
}

type TDiscordControllerParams = {
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
};

export default class DiscordController implements IDiscordController {
  private readonly logger: loggerInterfaces.ILogger;

  constructor({ loggerHandler }: TDiscordControllerParams) {
    this.logger = loggerHandler('DiscordController');
  }

  async sendWebhook(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    Promise.resolve(req.body)
      .then(validateDiscordSendWebhookInputParams)
      .tap(({ season, spaceUrl, spaceName, walletId, userName }) =>
        this.logger.logInfo(
          `An user enter the space: ${spaceName} with a url: ${spaceUrl} as a user with walletId: ${walletId}, userName: ${userName} (season ${season})`,
          { level: 'info', discord: true },
        ),
      )
      .then(res.status(204).send.bind(res))
      .catch(next);
  }
}
