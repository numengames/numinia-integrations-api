import { Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';

export default class MonitController {
  private _log;

  constructor(logger: (title: string) => ILogger) {
    this._log = logger('MonitController');
  }

  getHealthStatus(req: Request, res: Response) {
    res.status(200).send();
  }
}