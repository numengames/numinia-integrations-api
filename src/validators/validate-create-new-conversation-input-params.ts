import Joi from 'joi';
import { Request } from 'express';

import { paramNotValidError } from '../errors';

const schema = Joi.object({
  assistant: Joi.object({
    id: Joi.string().trim(),
    name: Joi.string().trim(),
  }),
  model: Joi.string().trim(),
  walletId: Joi.string().trim(),
  name: Joi.string().trim().required(),
  type: Joi.string().trim().required(),
  origin: Joi.string().trim().required(),
  conversationId: Joi.string().trim().required(),
})
  .xor('assistant', 'model')
  .required();

export default async (body: Request['body']) => {
  try {
    const response = await schema.validateAsync(body);
    return response;
  } catch (error: unknown) {
    throw paramNotValidError((error as Joi.ValidationError).message);
  }
};
