/* eslint-disable @typescript-eslint/no-explicit-any */
import LokiTransport from 'winston-loki';
import morgan, { StreamOptions } from 'morgan';
import TransportStream from 'winston-transport';
import DiscordTransport from 'winston-discord-transport';
import { createLogger, format, Logger, transports } from 'winston';
import { NextFunction, Request, Response, Application } from 'express';

import { TLoggerConfig } from '../config/types';

const { combine, prettyPrint } = format;

const ignoreMessageList = (ignoreList: Array<string>) => format((info) => (
  ignoreList.some(item => JSON.stringify(info).includes(item)) ? false : info
))();

export default ({ loki, discord }: TLoggerConfig, app: Application): void => {
  const transportList: TransportStream[] = [
    new transports.Console({
      silent: process.env.LOG !== '1',
      format: combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        format.colorize({ all: true }),
        format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
              return `${timestamp} ${level}: ${message} - ${stack}`;
          }
          return `${timestamp} ${level}: ${message}`;
        }),
      )
    })
  ];
  
  if (process.env.NODE_ENV === 'production') {
    transportList.push(new LokiTransport({
      format: combine(
        ignoreMessageList(['monit/health']),
        prettyPrint(),
        format.colorize({ all: true }),
      ),
      host: loki.host,
      silent: !loki.isActive,
      labels: { job: loki.job },
      basicAuth: `${loki.user}:${loki.password}`,
    }));

    if (discord.isActive) {
      transportList.push(new DiscordTransport({
        level: 'info',
        webhook: discord.webhook,
        defaultMeta: { service: discord.service },
      }));
    }
  }

  const logger: Logger = createLogger({
    exitOnError: false,
    transports: transportList,
    format: combine(format.errors({ stack: true })),
  });

  const morganOptions: StreamOptions = {
    write: function (message: string) {
      logger.info.call(logger, {
        discord: false,
        message: message.trim(),
        labels: { message: message.trim() }
      });
    },
  };

  function initLogger(req: Request, res: Response, next: NextFunction) {
    console.log = (args) => logger.info.call(logger, args);
    console.info = (args) => logger.info.call(logger, args);
    console.warn = (args) => logger.warn.call(logger, args);
    console.error = (args) => logger.error.call(logger, args);
    console.debug = (args) => logger.debug.call(logger, args);
  
    next();
  }

  app.use(morgan('tiny', { stream: morganOptions }));
  app.use(initLogger);
};