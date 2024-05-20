import Boom from '@hapi/boom';

const badData = (message?: string) => Boom.badData(message);
const notFound = (message?: string) => Boom.notFound(message);
const failedDependency = (message?: string) => Boom.failedDependency(message);
const boomify = (error: Error, code?: number) =>
  Boom.boomify(error, { statusCode: code || 400 });

export const openAIError = boomify;
export const paramNotValidError = badData;
export const userNotExistError = notFound;
export const openaiStreamError = failedDependency;
export const conversationNotExistError = notFound;
export const userHasNotInternalAccountError = notFound;
