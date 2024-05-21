import { Request, Response } from 'express';
import { interfaces } from '@numengames/numinia-logger';

export interface IMonitController {
  getHealthStatus: (req: Request, res: Response) => void;
}

type TMonitControllerParams = {
  loggerHandler: (title: string) => interfaces.ILogger;
};

export default class MonitController implements IMonitController {
  private readonly logger;

  constructor({ loggerHandler }: TMonitControllerParams) {
    this.logger = loggerHandler('MonitController');
  }

  getHealthStatus(req: Request, res: Response): void {
    res.status(200).send();
  }
}
