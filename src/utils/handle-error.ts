import {
  Request,
  Response,
  NextFunction,
} from 'express';
import Boom from '@hapi/boom';
import { CustomError, HttpError } from '../types/errors';

import loggerHandler from './logger';

const DefaultError = Boom.badImplementation().output;

const logger = loggerHandler('handleError');

/**
 * handleError
 *
 * @param {Object} error
 * @param {Number} error.responseCode - response status code
 * @param {String} error.responseMessage - text to export
 * @param {Object[]} error.responseErrors
 */
function handleError(error: Error | HttpError | Boom.Boom, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof Boom.Boom) {
    error = <HttpError>error.output;
  }

  let payload;
  let statusCode;

  if ((<HttpError>error).payload) {
    const originalError = (<HttpError>error).error || <CustomError>error;

    statusCode = (<HttpError>error).statusCode;

    payload = {
      ...(<HttpError>error).payload,
      errorCode: originalError.code,
    };

    logger.logError(`${req.originalUrl} - error: ${payload.message}`, originalError);
  } else {
    logger.logError(`${req.originalUrl} - error:`, error);
  }

  return res
    .status(statusCode || DefaultError.statusCode)
    .json(payload || DefaultError.payload);
}

export default handleError;
