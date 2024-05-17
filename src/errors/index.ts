import Boom from '@hapi/boom';

const badData = (message?: string) => Boom.badData(message);
const notFound = (message?: string) => Boom.notFound(message);
const forbidden = (message?: string) => Boom.forbidden(message);
const unauthorized = (message?: string) => Boom.unauthorized(message);
const failedDependency = (message?: string) => Boom.failedDependency(message);

export const paramNotValidError = badData;
export const userNotExistError = notFound;
export const userIsNotActiveError = forbidden;
export const missingCredentialsError = forbidden;
export const jwtUnauthorizedError = unauthorized;
export const userUnauthorizedError = unauthorized;
export const openaiStreamError = failedDependency;
export const conversationNotExistError = notFound;
export const userHasNotInternalAccountError = notFound;
