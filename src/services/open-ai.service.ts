import OpenAI from 'openai';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { openaiStreamError } from '../errors';
import { assistants, temperatures } from '../config/openai';
import { RunCreateParamsStreaming } from 'openai/resources/beta/threads/runs';

export interface IOpenAIService {
  getAudioFromMessage: ({ message }: { message: any }) => Promise<Buffer>;
  sendMessage: (
    { hasVoiceResponse, temperature, message, model }: Record<string, string>,
    callback: (text?: string) => void,
  ) => Promise<void | string>;
  sendMessageToAssistant: (
    {
      assistant,
      hasVoiceResponse,
      temperature,
      threadId,
    }: Record<string, string>,
    callback: (text?: string) => void,
  ) => Promise<void | string>;
}

type TOpenAIService = {
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
};

export default class OpenAIService implements IOpenAIService {
  private readonly openaiClient: OpenAI;

  private readonly logger: loggerInterfaces.ILogger;

  constructor({ loggerHandler }: TOpenAIService) {
    this.logger = loggerHandler('OpenAIService');

    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  private _getTemperature(temperature: string = ''): number {
    return temperatures[temperature] || temperatures.TEMP_MEDIUM;
  }

  private _getAssistantId(assistant: string): string {
    return assistants[assistant]?.openaiId;
  }

  async getAudioFromMessage({ message }: Record<string, any>): Promise<Buffer> {
    try {
      const response = await this.openaiClient.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: message,
      });

      const audioStream: any = response.body;

      const chunks: Buffer[] = [];

      audioStream.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      return new Promise((resolve, reject) => {
        audioStream.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        audioStream.on('error', (error: Error) => {
          reject(error);
        });
      });
    } catch (error: any) {
      this.logger.logError(error);
      throw new Error();
    }
  }

  async sendMessage(
    {
      message: content,
      hasVoiceResponse,
      temperature,
      model,
    }: Record<string, string>,
    callback: (text?: string) => void,
  ): Promise<void | string> {
    try {
      const temp = this._getTemperature(temperature);

      const stream = await this.openaiClient.chat.completions.create({
        stream: true,
        model: model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content }],
        temperature: temp || temperatures.TEMP_MEDIUM,
      });

      let message = '';

      for await (const chunk of stream) {
        const chunkMessage = chunk.choices[0]?.delta.content || '';

        message += chunkMessage;

        if (!hasVoiceResponse) {
          callback(chunkMessage);
        }
      }

      return hasVoiceResponse ? message : callback();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'string' ? error : JSON.parse(JSON.stringify(error));

      this.logger.logError(
        'There is a problem sending a message',
        errorMessage,
      );
      throw openaiStreamError(errorMessage.message);
    }
  }

  async sendMessageToAssistant(
    {
      assistant,
      hasVoiceResponse,
      temperature,
      message: content,
    }: Record<string, string>,
    callback: (text?: string) => void,
  ): Promise<void | string> {
    try {
      const temp = this._getTemperature(temperature);
      const assistantId = this._getAssistantId(assistant);

      this.logger.logInfo('sendMessageToAssistant - Creating the thread');
      const thread = await this.openaiClient.beta.threads.create({
        messages: [{ role: 'assistant', content }],
      });

      this.logger.logInfo(
        `sendMessageToAssistant - Trying to send a message to the assistant ${assistant} with id ${assistantId}`,
      );
      const params: RunCreateParamsStreaming = {
        assistant_id: assistantId,
        stream: true,
      };

      if (temp) {
        params.temperature = temp;
      }

      const stream = await this.openaiClient.beta.threads.runs.create(
        thread.id,
        params,
      );

      let message = '';

      for await (const event of stream) {
        if (event.event === 'thread.message.delta') {
          const chunk = event.data.delta.content?.[0];
          if (chunk && 'text' in chunk && chunk.text && chunk.text.value) {
            message += chunk.text.value;
            if (!hasVoiceResponse) {
              callback(chunk.text.value);
            }
          }
        }
      }

      return hasVoiceResponse ? message : callback();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'string' ? error : JSON.parse(JSON.stringify(error));

      this.logger.logError(
        'sendMessageToAssistantStreamRaw - There is a problem sending a message',
        errorMessage,
      );
      throw openaiStreamError(errorMessage.error);
    }
  }
}
