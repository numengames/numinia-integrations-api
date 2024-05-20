import Joi from 'joi';
import { Request } from 'express';

import { roles } from '../config/openai';
import { paramNotValidError } from '../errors';

interface IParams {
  body: Request['body'];
  params: Request['params'];
}

const schema = Joi.object({
  role: Joi.string()
    .uppercase()
    .trim()
    .valid(...Object.keys(roles))
    .required(),
  message: Joi.string().trim().required(),
  conversationId: Joi.string().trim().required(),
}).required();

export default async ({ body, params }: IParams) => {
  try {
    const response = await schema.validateAsync({ ...body, ...params });
    return response;
  } catch (error: unknown) {
    throw paramNotValidError((error as Joi.ValidationError).message);
  }
};
