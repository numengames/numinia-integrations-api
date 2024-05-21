import Boom, { Payload } from '@hapi/boom';

export interface CustomError extends Error {
  errorCode?: string;
}
export interface HttpError extends Boom.Output {
  payload: Payload;
  statusCode: number;
  error?: CustomError;
}
