import { Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';

export interface IMonitController {
  getHealthStatus: (req: Request, res: Response) => void
}

type TMonitControllerParams = {
  logger: (title: string) => ILogger
}

export default class MonitController implements IMonitController {
  private readonly _logger;

  constructor({ logger }: TMonitControllerParams) {
    this._logger = logger('MonitController');
  }

  getHealthStatus(req: Request, res: Response): void {
    res.status(204).send();
  }
}