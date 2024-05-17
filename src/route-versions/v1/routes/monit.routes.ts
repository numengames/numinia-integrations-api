import { Router } from 'express';
import { interfaces } from '@numengames/numinia-logger';

import MonitController, {
  IMonitController,
} from '../controllers/monit.controller';

export default class MonitRoutes {
  router: Router;

  private monitController: IMonitController;

  constructor(loggerHandler: (title: string) => interfaces.ILogger) {
    this.router = Router();

    this.monitController = new MonitController({ loggerHandler });

    this.routes();
  }

  routes() {
    this.router.get(
      '/health',
      this.monitController.getHealthStatus.bind(this.monitController),
    );
  }
}
