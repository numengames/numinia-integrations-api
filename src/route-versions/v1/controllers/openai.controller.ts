import { NextFunction, Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';
import { IOpenAIService } from '../../services/open-ai.service';
import validateOpenaiSendMessageInputParams from '../../../validators/validate-openai-send-message-input-params';
import validateOpenaiSendMessageWithAssistantInputParams from '../../../validators/validate-openai-send-message-with-assistant-input-params';

export interface IOpenAIController {
  sendTextMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>
  assistantSendTextMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>
}

type TOpenAIParams = {
  openAIService: IOpenAIService
  logger: (title: string) => ILogger
}

export default class OpenAIController implements IOpenAIController {
  private readonly _logger: ILogger;

  private readonly openAIService: IOpenAIService;

  constructor({ logger, openAIService }: TOpenAIParams) {
    this._logger = logger('OpenAIController');
    this.openAIService = openAIService;
  }

  private _manageTextResponse(res: Response, text?: string) {
    text !== undefined ? res.write(text) : res.end();
  }

  private _manageAudioResponse(buffer: Buffer, res: Response) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  }

  async sendTextMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const textResponse = (text?: string) => { this._manageTextResponse(res, text); };

    Promise.resolve(req.body)
      .tap(() => this._logger.logInfo('sendTextMessage'))
      .then(validateOpenaiSendMessageInputParams)
      .then(async (params) => {
        if (params.hasVoiceResponse) {
          const message = await this.openAIService.sendMessage(params, () => {});
          const stream = await this.openAIService.getAudioFromMessage({ message });
          this._manageAudioResponse(stream, res);
        } else {
          await this.openAIService.sendMessage(params, textResponse);
        }
      })
      .catch(next);
  }

  async assistantSendTextMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    const textResponse = (text?: string) => { this._manageTextResponse(res, text); };

    Promise.resolve(req.body)
      .tap(() => this._logger.logInfo('assistantSendTextMessage'))
      .then(validateOpenaiSendMessageWithAssistantInputParams)
      .then(async (params) => {
        if (params.hasVoiceResponse) {
          const message = await this.openAIService.sendMessageToAssistant(params, () => {});
          const stream = await this.openAIService.getAudioFromMessage({ message });
          this._manageAudioResponse(stream, res);
        } else {
          await this.openAIService.sendMessageToAssistant(params, textResponse);
        }
      })
      .catch(next);
  }
}