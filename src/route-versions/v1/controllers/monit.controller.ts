import { Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';

export interface IMonitController {
  getHealthStatus: (req: Request, res: Response) => void
}

type TMonitControllerParams = {
  logger: (title: string) => ILogger
}

export default class MonitController implements IMonitController {
  private _log;

  constructor({ logger }: TMonitControllerParams) {
    this._log = logger('MonitController');
  }

  getHealthStatus(req: Request, res: Response): void {
    Promise.resolve().then(res.status(200).send.bind(res));
  }
}