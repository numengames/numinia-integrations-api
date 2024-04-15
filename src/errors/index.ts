import Boom from '@hapi/boom';

const badData = (message?: string) => Boom.badData(message);
const failedDependency = (message?: string) => Boom.failedDependency(message);

export const paramNotValidError = badData;
export const openaiStreamError = failedDependency;