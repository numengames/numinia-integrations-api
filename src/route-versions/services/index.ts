import logger from '../../utils/logger';
import OpenAIService from './open-ai.service';

const openAIService = new OpenAIService({ logger });

export {
  openAIService,
};