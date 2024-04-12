import Joi from 'joi';
import { Request } from 'express';

import { paramNotValidError } from '../errors';

const schema = Joi.object({
  season: Joi.number().required(),
  spaceUrl: Joi.string().trim().required(),
  spaceName: Joi.string().trim().required(),
  walletId: Joi.string().trim().required(),
  userName: Joi.string().trim().required(),
});

export default async (body: Request['body']) => {
  try {
    const response = await schema.validateAsync(body);
    return response;
  } catch (error: unknown) {
    throw paramNotValidError((error as Joi.ValidationError).message);
  }
};
