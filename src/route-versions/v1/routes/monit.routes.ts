import { Router } from 'express';

import logger from '../../../utils/logger';
import MonitController from '../controllers/monit.controller';

export default class MonitRoutes {
  router: Router;

  monitController = new MonitController(logger);

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get('/health', this.monitController.getHealthStatus.bind(this.monitController));
  }
}