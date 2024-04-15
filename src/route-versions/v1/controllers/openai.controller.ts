import { NextFunction, Request, Response } from 'express';

import { ILogger } from '../../../utils/logger';
import { IOpenAIService } from '../../services/open-ai.service';
import validateOpenaiSendMessageInputParams from '../../../validators/validate-openai-send-message-input-params';
import validateOpenaiSendMessageWithAssistantInputParams from '../../../validators/validate-openai-send-message-with-assistant-input-params';

export interface IOpenAIController {
  sendTextMessage: (req: Request, res: Response, next: NextFunction) => void
  assistantSendTextMessage: (req: Request, res: Response, next: NextFunction) => void
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
    if (text !== undefined) {
      res.write(text);
    } else {
      res.end();
    }
  }

  private _manageAudioResponse(buffer: Buffer, res: Response) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(buffer);
  }

  private async _processTextResponse(params: Record<string, string>, res: Response): Promise<void> {
    const { assistant, hasVoiceResponse } = params;

    const textResponse = (text?: string) => { this._manageTextResponse(res, text); };

    if (assistant) {
      if (hasVoiceResponse) {
        const message = await this.openAIService.sendMessageToAssistantStream(params, () => {});
        const stream = await this.openAIService.getAudioFromMessage({ message });
        this._manageAudioResponse(stream, res);
      } else {
        await this.openAIService.sendMessageToAssistantStream(params, textResponse);
      }
    } else {
      if (hasVoiceResponse) {
        const message = await this.openAIService.sendMessageToChatGPT(params, () => {});
        const stream = await this.openAIService.getAudioFromMessage({ message });
        this._manageAudioResponse(stream, res);
      } else {
        await this.openAIService.sendMessageToChatGPT(params, textResponse);
      }
    }
  }

  sendTextMessage(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(req.body)
      .tap(() => this._logger.logInfo('sendMessageToOpenAI'))
      .then(validateOpenaiSendMessageInputParams)
      .then((params) => this._processTextResponse(params, res))
      .catch(next);
  }

  assistantSendTextMessage(req: Request, res: Response, next: NextFunction) {
    Promise.resolve(req.body)
      .tap(() => this._logger.logInfo('sendMessageToOpenAIWithAssistant'))
      .then(validateOpenaiSendMessageWithAssistantInputParams)
      .then((params) => this._processTextResponse(params, res))
      .catch(next);
  }
}