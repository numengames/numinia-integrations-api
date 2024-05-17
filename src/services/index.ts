import {
  ConversationModel,
  ConversationChunkModel,
} from '@numengames/numinia-models';
import { loggerHandler } from '@numengames/numinia-logger';

import OpenAIService from './open-ai.service';
import ConversationService from './conversation.service';

export const conversationService = new ConversationService({
  loggerHandler,
  ConversationModel,
  ConversationChunkModel,
});
export const openAIService = new OpenAIService({ loggerHandler });
