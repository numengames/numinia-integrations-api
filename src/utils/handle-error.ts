import Boom from '@hapi/boom';
import { Request, Response, NextFunction } from 'express';
import { loggerHandler } from '@numengames/numinia-logger';

import { CustomError, HttpError } from '../types/errors';

const DefaultError = Boom.badImplementation().output;

const logger = loggerHandler('handleError');

function isHttpError(error: any): error is HttpError {
  return error && typeof error.statusCode === 'number';
}

function handleError(
  error: Error | HttpError | Boom.Boom,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Boom.Boom) {
    return res.status(error.output.statusCode).json(error.output.payload);
  }

  let payload;
  let statusCode;

  if (isHttpError(error)) {
    if ((<HttpError>error).payload) {
      const originalError = error.error || (error as unknown as CustomError);

      statusCode = (<HttpError>error).statusCode;

      payload = {
        ...(<HttpError>error).payload,
        errorCode: originalError.errorCode,
      };

      logger.logError(
        `${req.originalUrl} - error: ${payload.message}`,
        originalError,
      );
    }
  } else {
    logger.logError(`${req.originalUrl} - error:`, error);
  }

  return res
    .status(statusCode || DefaultError.statusCode)
    .json(payload || DefaultError.payload);
}

export default handleError;
