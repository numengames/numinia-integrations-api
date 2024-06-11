import {
  mongoose,
  constants,
  UserModel,
  ConversationModel,
  types as modelTypes,
  ConversationChunkModel,
  interfaces as modelInterfaces,
} from '@numengames/numinia-models';

import {
  insertUser,
  insertConversation,
  insertConversationChunk,
} from '../../insert-data-to-model';
import { conversationService } from '../../../src/services';
import { conversationNotExistError } from '../../../src/errors';
import generateStringRandomNumber from '../../utils/generate-random-string-number';

const testDatabase = require('../../test-db')(mongoose);

describe('ConversationService', () => {
  beforeAll(() => testDatabase.connect());

  afterAll(() => testDatabase.close());

  describe('createConversation', () => {
    let userDocument: modelInterfaces.UserAttributes;

    const parsedParams: modelInterfaces.ConversationAttributes = {
      name: 'test',
      model: 'gpt-4o',
      conversationId: 'test-999',
      type: constants.ConversationTypes.CHATGPT,
      origin: constants.ConversationOrigins.DISCORD,
    };

    beforeAll(async () => {
      userDocument = await insertUser();

      parsedParams.user = userDocument._id;

      await conversationService.createConversation(parsedParams);
    });

    afterAll(() =>
      Promise.all([
        UserModel.deleteOne({ _id: userDocument._id }),
        ConversationModel.deleteOne({
          conversationId: parsedParams.conversationId,
        }),
      ]),
    );

    test('it should create an account document with a specified params', async () => {
      const conversationDocument = <modelTypes.ConversationDocument>(
        await ConversationModel.findOne({
          conversationId: parsedParams.conversationId,
        }).lean()
      );
      expect(conversationDocument._id).toBeDefined();
      expect(conversationDocument.createdAt).toBeDefined();
      expect(conversationDocument.updatedAt).toBeDefined();
      expect(conversationDocument.name).toBe(parsedParams.name);
      expect(conversationDocument.type).toBe(parsedParams.type);
      expect(conversationDocument.model).toBe(parsedParams.model);
      expect(conversationDocument.origin).toBe(parsedParams.origin);
      expect(conversationDocument.user?.toString()).toBe(
        parsedParams.user?.toString(),
      );
      expect(conversationDocument.conversationId).toBe(
        parsedParams.conversationId,
      );
    });
  });

  describe('createConversationChunk', () => {
    describe('when conversation does not exist', () => {
      const params: Record<string, string> = {
        message: 'Test',
        role: 'assistant',
        conversationId: `thread-${generateStringRandomNumber(10)}`,
        format: constants.ConversationChunkFormat.TEXT,
      };

      test('it should throw a Boom.notExist error', async () => {
        await expect(
          conversationService.getConversationChunkListLean(
            params.conversationId,
          ),
        ).rejects.toThrow(conversationNotExistError());
      });
    });

    describe('when conversation chunk is created', () => {
      const params: modelInterfaces.ConversationChunkAttributes = {
        value: 'Test',
        role: 'assistant',
        conversationId: `thread-${generateStringRandomNumber(10)}`,
        format: constants.ConversationChunkFormat.TEXT,
      };

      beforeAll(async () => {
        await insertConversation({
          conversationId: params.conversationId,
        });

        await conversationService.createConversationChunk(params);
      });

      afterAll(() =>
        Promise.all([
          ConversationModel.deleteOne({
            conversationId: params.conversationId,
          }),
          ConversationChunkModel.deleteOne({
            conversationId: params.conversationId,
          }),
        ]),
      );

      test('it should create an account document with a specified params', async () => {
        const conversationChunkDocument = <
          modelTypes.ConversationChunkDocument
        >await ConversationChunkModel.findOne({
          conversationId: params.conversationId,
        });

        expect(conversationChunkDocument._id).toBeDefined();
        expect(conversationChunkDocument.createdAt).toBeDefined();
        expect(conversationChunkDocument.updatedAt).toBeDefined();
        expect(conversationChunkDocument.value).toBe(params.value);
        expect(conversationChunkDocument.role).toBe(params.role);
        expect(conversationChunkDocument.format).toBe(params.format);
        expect(conversationChunkDocument.conversationId).toBe(
          params.conversationId,
        );
      });
    });
  });

  describe('getConversationChunkListLean', () => {
    describe('when conversation does not exist', () => {
      const conversationId = `thread-${generateStringRandomNumber(10)}`;

      test('it should throw a Boom.notExist error', async () => {
        await expect(
          conversationService.getConversationChunkListLean(conversationId),
        ).rejects.toThrow(conversationNotExistError());
      });
    });

    describe('when conversation exists', () => {
      let conversationChunkList: modelInterfaces.ConversationChunkAttributes[];

      const conversationId = `thread-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        await insertConversation({ conversationId });

        await Promise.all([
          insertConversationChunk({ conversationId }),
          insertConversationChunk({ conversationId }),
          insertConversationChunk({ conversationId }),
        ]);

        conversationChunkList =
          await conversationService.getConversationChunkListLean(
            conversationId,
          );
      });

      afterAll(() =>
        Promise.all([
          ConversationModel.deleteOne({ conversationId }),
          ConversationChunkModel.deleteMany({ conversationId }),
        ]),
      );

      test('it should get 3 messages from the specific conversation', () => {
        expect(conversationChunkList).toHaveLength(3);
      });

      test('it should response the message with specific params', async () => {
        expect(conversationChunkList[0].role).toBeDefined();
        expect(conversationChunkList[0].value).toBeDefined();
        expect(conversationChunkList[0]._id).toBeUndefined();
        expect(conversationChunkList[0].format).toBeDefined();
        expect(conversationChunkList[0].createdAt).toBeDefined();
        expect(conversationChunkList[0].updatedAt).toBeUndefined();
        expect(conversationChunkList[0].conversationId).toBeDefined();
      });
    });
  });
});
