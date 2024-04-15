import Joi from 'joi';
import { Request } from 'express';

import { paramNotValidError } from '../errors';
import openaiAssistants from '../config/openai/assistants';

const schema = Joi.object({
  temperature: Joi.string().trim(),
  message: Joi.string().trim().required(),
  hasVoiceResponse: Joi.boolean().default(false),
  assistant:  Joi.string().uppercase().trim().valid(...Object.keys(openaiAssistants)),
});

export default async (body: Request['body']) => {
  try {
    const response = await schema.validateAsync(body);
    return response;
  } catch (error: unknown) {
    throw paramNotValidError((error as Joi.ValidationError).message);
  }
};
