import {
  types,
  mongoose,
  constants,
  UserModel,
  ConversationModel,
  ConversationChunkModel,
  interfaces as modelInterfaces,
} from '@numengames/numinia-models';
import supertest from 'supertest';

import { server } from '../../../../src/server';
import { roles } from '../../../../src/config/openai';
import { insertConversation, insertUser } from '../../../insert-data-to-model';
import generateStringRandomNumber from '../../../utils/generate-random-string-number';

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
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
        })
        .expect(422);
    });

    test('when the origin param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          name: 'Test',
          type: constants.ConversationTypes.CHATGPT,
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
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
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
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
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
          assistant: {
            name: 'Test',
            id: 'asst_0000000000',
          },
          model: 'gpt-4o',
        })
        .expect(422);
    });

    describe('when the conversation with assistant has been created', () => {
      let response: supertest.Response;

      const params: Partial<modelInterfaces.ConversationAttributes> = {
        name: 'Test',
        type: constants.ConversationTypes.CHATGPT,
        origin: constants.ConversationOrigins.WEB,
        conversationId: `conversation-${generateStringRandomNumber(10)}`,
        assistant: {
          name: 'Test',
          id: 'asst_0000000000',
        },
      };

      beforeAll(async () => {
        response = await supertest(server.app).post(path).send(params);
      });

      afterAll(() =>
        ConversationModel.deleteOne({
          conversationId: params.conversationId,
        }),
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
        expect(conversationDocument.user).not.toBeDefined();
        expect(conversationDocument.conversationId).toBe(params.conversationId);
        expect(conversationDocument.assistant).toBeDefined();
        expect(conversationDocument.assistant?.id).toBe(params.assistant?.id);
        expect(conversationDocument.assistant?.name).toBe(
          params.assistant?.name,
        );
      });
    });

    describe('when the conversation with model has been created', () => {
      let response: supertest.Response;

      let userDocument: modelInterfaces.UserAttributes;

      const params: Record<string, unknown> = {
        name: 'Test',
        model: 'gpt-4o',
        type: constants.ConversationTypes.CHATGPT,
        origin: constants.ConversationOrigins.WEB,
        conversationId: `conversation-${generateStringRandomNumber(10)}`,
      };

      beforeAll(async () => {
        userDocument = await insertUser();

        params.walletId = userDocument.wallet;

        response = await supertest(server.app).post(path).send(params);
      });

      afterAll(() =>
        Promise.all([
          UserModel.deleteOne({ _id: userDocument._id }),
          ConversationModel.deleteOne({
            conversationId: params.conversationId,
          }),
        ]),
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
        expect(conversationDocument.user?.toString()).toBe(
          userDocument._id!.toString(),
        );
        expect(conversationDocument.type).toBe(params.type);
        expect(conversationDocument.name).toBe(params.name);
        expect(conversationDocument.createdAt).toBeDefined();
        expect(conversationDocument.updatedAt).toBeDefined();
        expect(conversationDocument.model).toBe(params.model);
        expect(conversationDocument.origin).toBe(params.origin);
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
          format: constants.ConversationChunkFormat.TEXT,
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
        })
        .expect(422);
    });

    test('when the format param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          message: 'Test',
          role: roles.USER,
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
        })
        .expect(422);
    });

    test('when the message param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          role: roles.USER,
          format: constants.ConversationChunkFormat.TEXT,
          conversationId: `conversation-${generateStringRandomNumber(10)}`,
        })
        .expect(422);
    });

    test('when the conversationId param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(path)
        .send({
          message: 'Test',
          role: roles.USER,
          format: constants.ConversationChunkFormat.TEXT,
        })
        .expect(422);
    });

    describe('when the conversation does not exist', () => {
      const params = {
        message: 'Test',
        role: roles.USER,
        format: constants.ConversationChunkFormat.TEXT,
        conversationId: `conversation-${generateStringRandomNumber(10)}`,
      };

      let response: supertest.Response;

      beforeAll(async () => {
        response = await supertest(server.app).post(path).send(params);
      });

      test('it should throw a Boom.notFound error', async () => {
        expect(response.status).toBe(404);
        expect(response.body).toMatchObject({
          statusCode: 404,
          error: 'Not Found',
          message: 'Not Found',
        });
      });
    });

    describe('when the conversation chunk document has been created', () => {
      let response: supertest.Response;

      const params: Record<string, string> = {
        message: 'test',
        role: roles.USER,
        format: constants.ConversationChunkFormat.TEXT,
        conversationId: `conversation-${generateStringRandomNumber(10)}`,
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

  describe('GET /:id', () => {
    const path = `${basePath}/`;

    test('when the assistant does not exist in database, it should throw an error', async () => {
      await supertest(server.app).post(`${path}/1`).expect(404);
    });

    describe('when the conversation exists in database', () => {
      let response: supertest.Response;

      let userDocument: modelInterfaces.UserAttributes;

      const conversationId = `conversation-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        userDocument = await insertUser();

        await insertConversation({ conversationId, user: userDocument._id });

        response = await supertest(server.app).get(`${path}/${conversationId}`);
      });

      afterAll(() =>
        Promise.all([
          UserModel.deleteOne({ _id: userDocument._id }),
          ConversationModel.deleteOne({ conversationId }),
        ]),
      );

      test('it should response a statusCode of 200', () => {
        expect(response.statusCode).toBe(200);
      });

      test('it should store all the params in the database', async () => {
        const conversationDocument = <types.ConversationDocument>(
          await ConversationModel.findOne({ conversationId })
        );

        expect(conversationDocument._id).toBeDefined();
        expect(conversationDocument.type).toBeDefined();
        expect(conversationDocument.name).toBeDefined();
        expect(conversationDocument.origin).toBeDefined();
        expect(conversationDocument.isActive).toBeTruthy();
        expect(conversationDocument.user?.toString()).toBe(
          userDocument._id?.toString(),
        );
        expect(conversationDocument.createdAt).toBeDefined();
        expect(conversationDocument.updatedAt).toBeDefined();
        expect(conversationDocument.conversationId).toBe(conversationId);
      });
    });
  });
});
