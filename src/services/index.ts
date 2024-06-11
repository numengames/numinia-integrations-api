import {
  UserModel,
  ConversationModel,
  ConversationChunkModel,
} from '@numengames/numinia-models';
import { createLoggerHandler as loggerHandler } from '@numengames/numinia-logger';

import UserService from './user.service';
import OpenAIService from './open-ai.service';
import ConversationService from './conversation.service';

export const conversationService = new ConversationService({
  loggerHandler,
  ConversationModel,
  ConversationChunkModel,
});
export const userService = new UserService({
  UserModel,
  loggerHandler,
});
export const openAIService = new OpenAIService({ loggerHandler });
