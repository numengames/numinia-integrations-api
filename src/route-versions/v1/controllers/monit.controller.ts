import { Request, Response } from 'express';

import logger from '../../../utils/logger';

export default class MonitController {
  private log = logger('MonitController');

  getHealthStatus(req: Request, res: Response) {

    this.log.logInfo('health status OK');
    res.status(200).send();
  }
}