import supertest from 'supertest';
import {
  types,
  mongoose,
  constants,
  ConversationModel,
  ConversationChunkModel,
} from '@numengames/numinia-models';

import { server } from '../../../../src/server';
import { insertConversation } from '../../../insert-data-to-model';
import { conversationNotExistError } from '../../../../src/errors';

const testDatabase = require('../../../test-db')(mongoose);

describe('ConversationRoutes', () => {
  const basePath = '/api/v1/conversation';

  beforeAll(() => testDatabase.connect());

  afterAll(() => testDatabase.close());

  describe('POST /', () => {
    const path = `${basePath}/`;

    test('when no params provided, it should response an error with status code 422', async () => {
      await supertest(server.app).post(path).expect(422);
    });

    test('when the conversation param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'test',
          type: constants.ConversationTypes.CHATGPT,
          origin: constants.ConversationOrigins.WEB,
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
        })
        .expect(422);
    });

    test('when the thread id param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'test',
          type: constants.ConversationTypes.CHATGPT,
          origin: constants.ConversationOrigins.WEB,
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
        })
        .expect(422);
    });

    test('when the assistant or model params are missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'Test',
          type: constants.ConversationTypes.CHATGPT,
          origin: constants.ConversationOrigins.WEB,
          conversationId: 'thread-0000000000000000000',
        })
        .expect(422);
    });

    test('when the origin param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'Test',
          type: constants.ConversationTypes.CHATGPT,
          conversationId: 'thread-0000000000000000000',
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
        })
        .expect(422);
    });

    test('when the type param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'Test',
          origin: constants.ConversationOrigins.WEB,
          conversationId: 'thread-0000000000000000000',
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
        })
        .expect(422);
    });

    test('when the assistant and model params are both defined, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'Test',
          type: constants.ConversationTypes.CHATGPT,
          origin: constants.ConversationOrigins.WEB,
          conversationId: 'thread-0000000000000000000',
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
          model: 'gpt-4o',
        })
        .expect(422);
    });

    describe('When the conversation with assistant has been created', () => {
      let response: supertest.Response;

      const params = {
        name: 'Test',
        type: constants.ConversationTypes.CHATGPT,
        origin: constants.ConversationOrigins.WEB,
        walletId: '0x0000000000000000000000dead',
        conversationId: 'thread-0000000000000000000',
        assistant: {
          name: 'Test',
          id: 'asst_0000000000',
        },
      };

      beforeAll(async () => {
        response = await supertest(server.app).post(path).send(params);
      });

      afterAll(() =>
        ConversationModel.deleteOne({ conversationId: params.conversationId }),
      );

      test('it should response a statusCode of 201 - Created', () => {
        expect(response.statusCode).toBe(201);
      });

      test('it should store all the params in the database', async () => {
        const conversationDocument = <types.ConversationDocument>(
          await ConversationModel.findOne({
            conversationId: params.conversationId,
          })
        );

        expect(conversationDocument._id).toBeDefined();
        expect(conversationDocument.isActive).toBeTruthy();
        expect(conversationDocument.type).toBe(params.type);
        expect(conversationDocument.name).toBe(params.name);
        expect(conversationDocument.createdAt).toBeDefined();
        expect(conversationDocument.updatedAt).toBeDefined();
        expect(conversationDocument.origin).toBe(params.origin);
        expect(conversationDocument.walletId).toBe(params.walletId);
        expect(conversationDocument.conversationId).toBe(params.conversationId);
        expect(conversationDocument.assistant).toBeDefined();
        expect(conversationDocument.assistant?.id).toBe(params.assistant.id);
        expect(conversationDocument.assistant?.name).toBe(
          params.assistant.name,
        );
      });
    });

    describe('When the conversation with model has been created', () => {
      let response: supertest.Response;

      const params = {
        name: 'Test',
        model: 'gpt-4o',
        type: constants.ConversationTypes.CHATGPT,
        origin: constants.ConversationOrigins.WEB,
        walletId: '0x0000000000000000000000dead',
        conversationId: 'thread-0000000000000000000',
      };

      beforeAll(async () => {
        response = await supertest(server.app).post(path).send(params);
      });

      afterAll(() =>
        ConversationModel.deleteOne({ conversationId: params.conversationId }),
      );

      test('it should response a statusCode of 201 - Created', () => {
        expect(response.statusCode).toBe(201);
      });

      test('it should store all the params in the database', async () => {
        const conversationDocument = <types.ConversationDocument>(
          await ConversationModel.findOne({
            conversationId: params.conversationId,
          })
        );

        expect(conversationDocument._id).toBeDefined();
        expect(conversationDocument.isActive).toBeTruthy();
        expect(conversationDocument.type).toBe(params.type);
        expect(conversationDocument.name).toBe(params.name);
        expect(conversationDocument.createdAt).toBeDefined();
        expect(conversationDocument.updatedAt).toBeDefined();
        expect(conversationDocument.model).toBe(params.model);
        expect(conversationDocument.origin).toBe(params.origin);
        expect(conversationDocument.walletId).toBe(params.walletId);
        expect(conversationDocument.conversationId).toBe(params.conversationId);
      });
    });
  });

  describe('POST /message', () => {
    const path = `${basePath}/message`;

    test('when no params provided, it should response an error with status code 422', async () => {
      await supertest(server.app).post(path).expect(422);
    });

    test('when the role param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          message: 'Test',
          conversationId: new mongoose.Types.ObjectId(),
          format: constants.ConversationChunkFormat.TEXT,
        })
        .expect(422);
    });

    test('when the format param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          message: 'Test',
          role: 'assistant',
          conversationId: new mongoose.Types.ObjectId(),
        })
        .expect(422);
    });

    test('when the message param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          role: 'assistant',
          conversationId: new mongoose.Types.ObjectId(),
          format: constants.ConversationChunkFormat.TEXT,
        })
        .expect(422);
    });

    test('when the conversationId param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          message: 'Test',
          role: 'assistant',
          format: constants.ConversationChunkFormat.TEXT,
        })
        .expect(422);
    });

    describe('When the conversation does not exist', () => {
      const params = {
        message: 'Test',
        role: 'assistant',
        conversationId: 'thread-0000000000000000000',
        format: constants.ConversationChunkFormat.TEXT,
      };

      test('it should throw a Boom.notFound error', () => {
        expect(supertest(server.app).post(path).send(params)).rejects.toThrow(
          conversationNotExistError(),
        );
      });
    });

    describe('When the conversation chunk document has been created', () => {
      let response: supertest.Response;

      const params: Record<string, string> = {
        message: 'Test',
        role: 'assistant',
        conversationId: 'thread-0000000000000000000',
        format: constants.ConversationChunkFormat.TEXT,
      };

      beforeAll(async () => {
        await insertConversation({
          conversationId: params.conversationId,
        });

        response = await supertest(server.app).post(path).send(params);
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

      test('it should response a statusCode of 201 - Created', () => {
        expect(response.statusCode).toBe(201);
      });

      test('it should store all the params in the database', async () => {
        const conversationChunkDocument = <types.ConversationChunkDocument>(
          await ConversationChunkModel.findOne({
            conversationId: params.conversationId,
          })
        );

        expect(conversationChunkDocument._id).toBeDefined();
        expect(conversationChunkDocument.role).toBe(params.role);
        expect(conversationChunkDocument.createdAt).toBeDefined();
        expect(conversationChunkDocument.updatedAt).toBeDefined();
        expect(conversationChunkDocument.value).toBe(params.message);
        expect(conversationChunkDocument.format).toBe(params.format);
        expect(conversationChunkDocument.conversationId).toBe(
          params.conversationId,
        );
      });
    });
  });
});
