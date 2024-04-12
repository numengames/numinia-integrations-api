import Boom from '@hapi/boom';

const badData = (message?: string) => Boom.badData(message);

export const paramNotValidError = badData;