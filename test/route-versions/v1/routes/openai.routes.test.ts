// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import OpenAI from 'openai';
import supertest from 'supertest';
import {
  mongoose,
  ConversationModel,
  ConversationChunkModel,
  constants as constantsModel,
} from '@numengames/numinia-models';
import { faker } from '@faker-js/faker';

// import { assistants } from '../../../../src/config/openai';
import {
  insertConversation,
  // insertConversationChunk,
} from '../../../insert-data-to-model';
import { server } from '../../../../src/server';
import { openAIError } from '../../../../src/errors';
import { assistants, roles } from '../../../../src/config/openai';
import generateStringRandomNumber from '../../../utils/generate-random-string-number';

const testDatabase = require('../../../test-db')(mongoose);

jest.mock('openai', () => {
  const mRuns = jest.fn();
  const mCreate = jest.fn();
  const mChat = {
    completions: { create: mCreate },
  };
  const mBeta = {
    threads: {
      create: mCreate,
      runs: { create: mRuns },
    },
  };
  const mOpenAIApi = {
    chat: mChat,
    beta: mBeta,
  };
  return {
    __esModule: true,
    default: jest.fn(() => mOpenAIApi),
    OpenAI: jest.fn(() => mOpenAIApi),
  };
});

class MockAbortController {
  private signal;

  constructor() {
    this.signal = new EventTarget();
  }

  abort() {
    const event = new Event('abort');
    this.signal.dispatchEvent(event);
  }
}

describe('OpenAIRoutes', () => {
  const basePath = '/api/v1/openai';

  beforeAll(() => testDatabase.connect());

  afterAll(() => testDatabase.close());

  describe('POST /conversation/text', () => {
    const path = `${basePath}/conversation/text`;

    test('when no params provided, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .expect(422);
    });

    test('when the message param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ role: roles.USER })
        .expect(422);
    });

    test('when the role param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ message: faker.lorem.sentence() })
        .expect(422);
    });

    test('when the conversation does not exist, it should response an error Boom.notFound with status code 404', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ role: roles.USER, message: faker.lorem.sentence() })
        .expect(404);
    });

    describe('when openAI has an issue on their servers', () => {
      let response: supertest.Response;

      const openaiClient = new OpenAI();

      const conversationId = `conversation-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        const mockCreate = openaiClient.chat.completions
          .create as jest.MockedFunction<
          typeof openaiClient.chat.completions.create
        >;

        // It can be 401, 403, 429, 500 & 503
        const mockError = openAIError(new Error(), 500);
        mockCreate.mockRejectedValueOnce(mockError);

        await insertConversation({ conversationId });

        response = await supertest(server.app)
          .post(`${path}/${conversationId}`)
          .send({
            role: roles.USER,
            message: faker.lorem.sentence(),
          });
      });

      afterAll(() => ConversationModel.deleteOne({ conversationId }));

      test('It should throw an Error with statusCode 424', () => {
        expect(response.status).toBe(424);
        expect(response.body).toMatchObject({
          statusCode: 424,
          error: 'Failed Dependency',
          message: 'Internal Server Error', // This error comes from openAI
        });
      });
    });

    describe('when openai responses and the question and answer are stored in database', () => {
      let response: supertest.Response;

      const openaiClient = new OpenAI();

      const outputMessage = ['Hello ', 'World'];
      const inputMessage = 'Can you please say something to the world?';

      const conversationId = `conversation-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        const mockCreate = openaiClient.chat.completions
          .create as jest.MockedFunction<
          typeof openaiClient.chat.completions.create
        >;

        const mockStream = {
          controller: new MockAbortController(),
          async *[Symbol.asyncIterator]() {
            yield { choices: [{ delta: { content: outputMessage[0] } }] };
            yield { choices: [{ delta: { content: outputMessage[1] } }] };
            yield { choices: [{ delta: { content: undefined } }] };
          },
        };

        mockCreate.mockResolvedValueOnce(mockStream);

        await insertConversation({ conversationId });

        response = await supertest(server.app)
          .post(`${path}/${conversationId}`)
          .send({
            role: roles.SYSTEM,
            message: inputMessage,
          });
      });

      afterAll(() =>
        Promise.all([
          ConversationModel.deleteOne({ conversationId }),
          ConversationChunkModel.deleteOne({ conversationId }),
        ]),
      );

      test('it should response a status code of 200', () => {
        expect(response.statusCode).toBe(200);
      });

      test('it should response a message with chunks', () => {
        expect(response.text).toBe(outputMessage.join(''));
      });

      test('it should store in database the request & response message from the IA', async () => {
        const conversationChunkList = await ConversationChunkModel.find({
          conversationId,
        }).lean();

        expect(conversationChunkList).toHaveLength(2);

        expect(conversationChunkList[0].value).toBe(inputMessage);
        expect(conversationChunkList[0].role).toBe(roles.SYSTEM);
        expect(conversationChunkList[0].conversationId).toBe(conversationId);
        expect(conversationChunkList[0].format).toBe(
          constantsModel.ConversationChunkFormat.TEXT,
        );

        expect(conversationChunkList[1].role).toBe(roles.ASSISTANT);
        expect(conversationChunkList[1].value).toBe(outputMessage.join(''));
        expect(conversationChunkList[1].conversationId).toBe(conversationId);
        expect(conversationChunkList[1].format).toBe(
          constantsModel.ConversationChunkFormat.TEXT,
        );
      });
    });
  });

  describe('POST /conversation/assistant/text', () => {
    const path = `${basePath}/conversation/assistant/text`;

    test('when no params provided, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .expect(422);
    });

    test('when the message param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ role: roles.USER })
        .expect(422);
    });

    test('when the role param is missing, it should response an error with status code 422', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ message: faker.lorem.sentence() })
        .expect(422);
    });

    test('when the conversation does not exist, it should response an error Boom.notFound with status code 404', async () => {
      await supertest(server.app)
        .post(`${path}/conversation-${generateStringRandomNumber(10)}`)
        .send({ role: roles.USER, message: faker.lorem.sentence() })
        .expect(404);
    });

    describe('when openAI has an issue on their servers', () => {
      let response: supertest.Response;

      const openaiClient = new OpenAI();

      const conversationId = `conversation-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        const mockCreate = openaiClient.beta.threads
          .create as jest.MockedFunction<
          typeof openaiClient.beta.threads.create
        >;

        // It can be 401, 403, 429, 500 & 503
        const mockError = openAIError(new Error(), 500);
        mockCreate.mockRejectedValueOnce(mockError);

        await insertConversation({
          conversationId,
          assistant: {
            name: assistants.TEST.name,
            id: assistants.TEST.openaiId,
          },
        });

        response = await supertest(server.app)
          .post(`${path}/${conversationId}`)
          .send({
            role: roles.USER,
            message: faker.lorem.sentence(),
          });
      });

      afterAll(() => ConversationModel.deleteOne({ conversationId }));

      test('It should throw an Error with statusCode 424', () => {
        expect(response.status).toBe(424);
        expect(response.body).toMatchObject({
          statusCode: 424,
          error: 'Failed Dependency',
          message: 'Internal Server Error', // This error comes from openAI
        });
      });
    });

    describe('when openai responses and the question and answer are stored in database', () => {
      let response: supertest.Response;

      const openaiClient = new OpenAI();

      const outputMessage = ['Hello ', 'World'];
      const inputMessage = 'Can you please say something to the world?';

      const conversationId = `conversation-${generateStringRandomNumber(10)}`;

      beforeAll(async () => {
        const mockThreadCreate = openaiClient.beta.threads
          .create as jest.MockedFunction<
          typeof openaiClient.beta.threads.create
        >;

        const mockThreadRunsCreate = openaiClient.beta.threads.runs
          .create as jest.MockedFunction<
          typeof openaiClient.beta.threads.runs.create
        >;

        const mockStream = {
          controller: new MockAbortController(),
          async *[Symbol.asyncIterator]() {
            yield {
              event: 'thread.message.delta',
              data: {
                delta: { content: [{ text: { value: outputMessage[0] } }] },
              },
            };
            yield {
              event: 'thread.message.delta',
              data: {
                delta: { content: [{ text: { value: outputMessage[1] } }] },
              },
            };
            yield {
              event: 'thread.message.delta',
              data: {
                delta: { content: [{ text: { value: undefined } }] },
              },
            };
          },
        };

        mockThreadCreate.mockResolvedValueOnce({ id: 'test' });
        mockThreadRunsCreate.mockResolvedValueOnce(mockStream);

        await insertConversation({
          conversationId,
          assistant: {
            name: assistants.TEST.name,
            id: assistants.TEST.openaiId,
          },
        });

        response = await supertest(server.app)
          .post(`${path}/${conversationId}`)
          .send({
            role: roles.SYSTEM,
            message: inputMessage,
          });
      });

      afterAll(() =>
        Promise.all([
          ConversationModel.deleteOne({ conversationId }),
          ConversationChunkModel.deleteOne({ conversationId }),
        ]),
      );

      test('it should response a status code of 200', () => {
        expect(response.statusCode).toBe(200);
      });

      test('it should response a message with chunks', () => {
        expect(response.text).toBe(outputMessage.join(''));
      });

      test('it should store in database the request & response message from the IA', async () => {
        const conversationChunkList = await ConversationChunkModel.find({
          conversationId,
        }).lean();

        expect(conversationChunkList).toHaveLength(2);

        expect(conversationChunkList[0].value).toBe(inputMessage);
        expect(conversationChunkList[0].role).toBe(roles.SYSTEM);
        expect(conversationChunkList[0].conversationId).toBe(conversationId);
        expect(conversationChunkList[0].format).toBe(
          constantsModel.ConversationChunkFormat.TEXT,
        );

        expect(conversationChunkList[1].role).toBe(roles.ASSISTANT);
        expect(conversationChunkList[1].value).toBe(outputMessage.join(''));
        expect(conversationChunkList[1].conversationId).toBe(conversationId);
        expect(conversationChunkList[1].format).toBe(
          constantsModel.ConversationChunkFormat.TEXT,
        );
      });
    });
  });
});
