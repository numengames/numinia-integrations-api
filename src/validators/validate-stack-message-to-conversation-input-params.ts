import Joi from 'joi';
import { Request } from 'express';

import { paramNotValidError } from '../errors';

const schema = Joi.object({
  role: Joi.string().trim().required(),
  format: Joi.string().trim().required(),
  message: Joi.string().trim().required(),
  conversationId: Joi.string().trim().required(),
}).required();

export default async (body: Request['body']) => {
  try {
    const response = await schema.validateAsync(body);
    return response;
  } catch (error: unknown) {
    throw paramNotValidError((error as Joi.ValidationError).message);
  }
};
