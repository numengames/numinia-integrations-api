import { Router } from 'express';


import MonitController from '../controllers/monit.controller';

export default class MonitRoutes {
  router: Router;

  monitController = new MonitController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router.get('/health', this.monitController.getHealthStatus.bind(this.monitController));
  }
}