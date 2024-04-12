import { Router } from 'express';

import { ILogger } from '../../../utils/logger';
import MonitController, { IMonitController } from '../controllers/monit.controller';

export default class MonitRoutes {
  router: Router;

  private monitController: IMonitController;

  constructor(logger: (title: string) => ILogger) {
    this.router = Router();
    
    this.monitController = new MonitController({ logger });

    this.routes();
  }

  routes() {
    this.router.get('/health', this.monitController.getHealthStatus.bind(this.monitController));
  }
}