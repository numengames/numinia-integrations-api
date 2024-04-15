import OpenAI from 'openai';

import { ILogger } from '../../utils/logger';
import { openaiStreamError } from '../../errors';
import { assistants, temperatures } from '../../config/openai';

export interface IOpenAIService {
  getAudioFromMessage: ({ message }: { message: any }) => Promise<Buffer>
  sendMessageToChatGPT: ({ hasVoiceResponse, temperature, message, model }: Record<string, string>, callback: (text?: string) => void) => Promise<void|string>
  sendMessageToAssistantStream: ({ assistant, hasVoiceResponse, temperature, message }: Record<string, string>, callback: (text?: string) => void) => Promise<void|string>
}

type TOpenAIService = {
  logger: (title: string) => ILogger
}

export default class OpenAIService implements IOpenAIService {
  private readonly _logger: ILogger;

  private readonly _openaiClient: OpenAI;

  constructor({ logger }: TOpenAIService) {    
    this._logger = logger('OpenAIService');

    this._openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }

  private _getTemperature(temperature: string = ''): number {
    return temperatures[temperature] || temperatures.TEMP_MEDIUM;
  } 

  private _getAssistantId(assistant: string): string {
    return assistants[assistant].openaiId;
  }

  async getAudioFromMessage({ message }: Record<string, any>): Promise<Buffer> {
    try {
      const response = await this._openaiClient.audio.speech.create({
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
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async sendMessageToChatGPT({ message: content, hasVoiceResponse, temperature, model }: Record<string, string>, callback: (text?: string) => void): Promise<void|string> {
    try {
      const temp = this._getTemperature(temperature);

      const stream = await this._openaiClient.chat.completions.create({
        stream: true,
        model: model || 'gpt-3.5-turbo',
        temperature: temp || temperatures.TEMP_MEDIUM,
        messages: [{ role: 'user', content }],
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
      const errorMessage = typeof error === 'string' ? error : JSON.parse(JSON.stringify(error));

      this._logger.logError('There is a problem sending a message', errorMessage);
      throw openaiStreamError(errorMessage.message);
    }
  }

  async sendMessageToAssistantStream({ assistant, hasVoiceResponse, temperature, message: content }: Record<string, string>, callback: (text?: string) => void): Promise<void|string> {    
    try {
      const temp = this._getTemperature(temperature);
      const assistantId = this._getAssistantId(assistant);

      this._logger.logInfo('sendMessageToAssistantStreamRaw - Creating the thread');
      const thread = await this._openaiClient.beta.threads.create({
        messages: [{ role: 'user', content }]
      });

      this._logger.logInfo(`sendMessageToAssistantStreamRaw - Trying to send a message to the assistant ${assistant} with id ${assistantId}`);
      const stream = await this._openaiClient.beta.threads.runs.create(
        thread.id,
        { assistant_id: assistantId, stream: true, temperature: temp || temperatures.TEMP_MEDIUM }
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
      const errorMessage = typeof error === 'string' ? error : JSON.parse(JSON.stringify(error));

      this._logger.logError('sendMessageToAssistantStreamRaw - There is a problem sending a message', errorMessage);
      throw openaiStreamError(errorMessage.message);
    }
  }
}