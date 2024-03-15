import 'dotenv/config';
import express from 'express';

import cors from 'cors';
import Bluebird from 'bluebird';
import compression from 'compression';

import config from './config';

import logger from './middlewares/logger';
import v1Routes from './route-versions/v1';
import handleError from './utils/handle-error';

global.Promise = <any>Bluebird;

class Server {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.preMiddlewareConfig();
    this.routes();
    this.postMiddlewareConfig();
  }

  public routes(): void {
    this.app.use('/api/v1', v1Routes());
  }

  public preMiddlewareConfig(): void {
    this.app.set('port', config.port);
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(compression());
    this.app.use(cors());
    // TODO: Try PINO package & pino-loki-transport instead of winston & winston-loki
    logger(config.logger, this.app);
  }

  public postMiddlewareConfig(): void {
    this.app.use(handleError);
  }

  public start(): void {
    this.app.listen(this.app.get('port'), () => {
      console.log(`API is running at http://localhost:${this.app.get('port')}`);
    });
  }
}

export const server = new Server();

if (process.env.NODE_ENV !== 'test') {
  server.start();
}