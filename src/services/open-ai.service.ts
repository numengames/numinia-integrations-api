import OpenAI from 'openai';
import { types as modelTypes } from '@numengames/numinia-models';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { roles } from '../config/openai';
import { openAIError, openaiStreamError } from '../errors';
import { ChatCompletionMessageParam } from 'openai/resources';
import { RunCreateParamsStreaming } from 'openai/resources/beta/threads/runs/runs';

interface IHandleTextConversationParams {
  params: Record<string, unknown>;
  callback: (text?: string) => void;
  messageList: ChatCompletionMessageParam[];
}

export interface IOpenAIService {
  handleTextConversation: (
    params: IHandleTextConversationParams,
  ) => Promise<Record<string, string>>;
  handleAssistantTextConversation: (
    params: IHandleTextConversationParams,
  ) => Promise<Record<string, string>>;
  // getAudioFromMessage: ({ message }: { message: any }) => Promise<Buffer>;
}

type TOpenAIService = {
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
};

export default class OpenAIService implements IOpenAIService {
  static DEFAULT_TEMPERATURE = 1;

  static DEFAULT_OPENAI_MODEL = 'gpt-4o';

  private readonly openaiClient: OpenAI;

  private readonly logger: loggerInterfaces.ILogger;

  constructor({ loggerHandler }: TOpenAIService) {
    this.logger = loggerHandler('OpenAIService');

    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  // async getAudioFromMessage({ message }: Record<string, any>): Promise<Buffer> {
  //   try {
  //     const response = await this.openaiClient.audio.speech.create({
  //       model: 'tts-1',
  //       voice: 'alloy',
  //       input: message,
  //     });

  //     const audioStream: any = response.body;

  //     const chunks: Buffer[] = [];

  //     audioStream.on('data', (chunk: Buffer) => {
  //       chunks.push(chunk);
  //     });

  //     return new Promise((resolve, reject) => {
  //       audioStream.on('end', () => {
  //         resolve(Buffer.concat(chunks));
  //       });

  //       audioStream.on('error', (error: Error) => {
  //         reject(error);
  //       });
  //     });
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       this.logger.logError('getAudioFromMessage - Error:', error);
  //     }
  //     throw new Error();
  //   }
  // }

  private handleError(methodName: string, error: unknown): never {
    if (error instanceof Error) {
      this.logger.logError(`${methodName} - Error:`, error);
      throw openAIError(error, 424);
    }
    const errorMessage = JSON.parse(JSON.stringify(error));
    this.logger.logError(`${methodName} - There is a problem`, errorMessage);
    throw openaiStreamError(errorMessage);
  }

  async handleTextConversation({
    callback,
    messageList,
    params: {
      isStreamResponse = true,
      model = OpenAIService.DEFAULT_OPENAI_MODEL,
      temperature = OpenAIService.DEFAULT_TEMPERATURE,
    },
  }: IHandleTextConversationParams): Promise<Record<string, string>> {
    try {
      this.logger.logInfo(
        'handleTextConversation - Sending the messageList to the model',
      );
      const stream = await this.openaiClient.chat.completions.create({
        stream: true,
        messages: messageList,
        model: model as string,
        temperature: temperature as number,
      });

      let message = '';

      this.logger.logInfo(
        'handleTextConversation - There is a response from openAI!',
      );
      for await (const chunk of stream) {
        const chunkMessage = chunk.choices[0]?.delta.content;

        if (chunkMessage !== undefined) {
          message += chunkMessage;
          if (isStreamResponse) {
            callback(chunkMessage as string);
          }
        }
      }

      return { role: roles.ASSISTANT, value: message };
    } catch (error: unknown) {
      this.handleError('handleTextConversation', error);
    }
  }

  async handleAssistantTextConversation({
    callback,
    messageList,
    params: {
      assistant,
      isStreamResponse = true,
      temperature = OpenAIService.DEFAULT_TEMPERATURE,
    },
  }: IHandleTextConversationParams): Promise<Record<string, string>> {
    try {
      const assistantId = (assistant as modelTypes.ConversationDocument).id;

      this.logger.logInfo(
        'handleAssistantTextConversation - Building the thread with the list of messages',
      );
      const thread = await this.openaiClient.beta.threads.create({
        messages:
          messageList as OpenAI.Beta.Threads.ThreadCreateParams.Message[],
      });

      this.logger.logInfo(
        'handleAssistantTextConversation - Building the stream',
      );
      const params: RunCreateParamsStreaming = {
        stream: true,
        assistant_id: assistantId,
      };
      if (temperature) {
        params.temperature = temperature as number;
      }

      this.logger.logInfo(
        `handleAssistantTextConversation - Sending the messageList to the model being helped by the assistant with id ${assistantId}`,
      );
      const stream = await this.openaiClient.beta.threads.runs.create(
        thread.id,
        params,
      );

      this.logger.logInfo(
        'handleAssistantTextConversation - There is a response from openAI!',
      );

      let message = '';

      for await (const event of stream) {
        if (event.event === 'thread.message.delta') {
          const chunk = event.data.delta.content?.[0];

          if (chunk && 'text' in chunk && chunk.text && chunk.text.value) {
            message += chunk.text.value;
            if (isStreamResponse) {
              this.logger.logInfo(
                'handleAssistantTextConversation - Sending chunks with openAI response',
              );
              callback(chunk.text.value);
            }
          }
        }
      }

      this.logger.logInfo(
        'handleAssistantTextConversation - Sending openAI response',
      );
      return { role: roles.ASSISTANT, value: message };
    } catch (error: unknown) {
      this.handleError('handleTextConversation', error);
    }
  }
}
