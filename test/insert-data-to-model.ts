import {
  constants,
  ConversationModel,
  ConversationChunkModel,
  interfaces as modelInterfaces,
} from '@numengames/numinia-models';
import generateStringRandomNumber from './utils/generate-random-string-number';
import { faker } from '@faker-js/faker';

export async function insertConversation(
  params: Partial<modelInterfaces.ConversationAttributes>,
): Promise<modelInterfaces.ConversationAttributes> {
  const parsedParams: Partial<modelInterfaces.ConversationAttributes> = {
    name: params.name || faker.lorem.word(),
    conversationId:
      params.conversationId || `thread-${generateStringRandomNumber(10)}`,
    type: params.type || constants.ConversationTypes.CHATGPT,
    walletId: params.walletId || faker.finance.ethereumAddress(),
    origin: params.origin || constants.ConversationOrigins.DISCORD,
  };

  if (params.model) {
    parsedParams.model = params.model;
  } else if (params.assistant) {
    parsedParams.assistant = params.assistant;
  } else {
    parsedParams.model = 'gpt-4o'; // By default, we set one
  }

  return ConversationModel.create(parsedParams);
}

export async function insertConversationChunk(
  params: Record<string, string>,
): Promise<modelInterfaces.ConversationChunkAttributes> {
  const parsedParams: Partial<modelInterfaces.ConversationChunkAttributes> = {
    role: params.role || faker.helpers.arrayElement(['assistant', 'user']),
    value: params.message || faker.lorem.lines(1),
    format: params.format || constants.ConversationChunkFormat.TEXT,
    conversationId:
      params.conversationId || `thread-${generateStringRandomNumber(10)}`,
  };

  return ConversationChunkModel.create(parsedParams);
}
