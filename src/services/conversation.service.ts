import {
  types as modelTypes,
  interfaces as modelInterfaces,
} from '@numengames/numinia-models';
import { Model } from 'mongoose';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

import { conversationNotExistError } from '../errors';

export interface IConversationService {
  createConversation(
    params: Partial<modelTypes.ConversationDocument>,
  ): Promise<void>;
  createConversationChunk(
    params: Partial<modelInterfaces.ConversationChunkAttributes>,
  ): Promise<void>;
  getConversationChunkListLean(
    conversationId: string,
  ): Promise<modelInterfaces.ConversationChunkAttributes[]>;
  parseConversationChunkParams(
    params: Record<string, string>,
  ): modelInterfaces.ConversationChunkAttributes;
  getConversationByConversationIdLean(
    conversationId: string,
  ): Promise<modelInterfaces.ConversationAttributes>;
}

interface ConversationServiceConstructor {
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
  ConversationModel: Model<modelInterfaces.ConversationAttributes>;
  ConversationChunkModel: Model<modelInterfaces.ConversationChunkAttributes>;
}

export default class ConversationService implements IConversationService {
  private readonly logger: loggerInterfaces.ILogger;

  private readonly ConversationModel: Model<modelInterfaces.ConversationAttributes>;

  private readonly ConversationChunkModel: Model<modelInterfaces.ConversationChunkAttributes>;

  constructor({
    loggerHandler,
    ConversationModel,
    ConversationChunkModel,
  }: ConversationServiceConstructor) {
    this.ConversationModel = ConversationModel;
    this.ConversationChunkModel = ConversationChunkModel;
    this.logger = loggerHandler('ConversationService');
  }

  private async conversationExistByConversationId(
    conversationId: string,
  ): Promise<void> {
    this.logger.logInfo(
      `getConversationByConversationId - Trying to get a conversation with conversationId ${conversationId}`,
    );
    const conversationExist = await this.ConversationModel.exists({
      conversationId,
    });

    if (!conversationExist) {
      throw conversationNotExistError();
    }
  }

  async getConversationByConversationIdLean(
    conversationId: string,
  ): Promise<modelInterfaces.ConversationAttributes> {
    const conversationLeanDocument = await this.ConversationModel.findOne({
      conversationId,
    }).lean();

    if (!conversationLeanDocument) {
      throw conversationNotExistError();
    }

    return conversationLeanDocument;
  }

  parseConversationChunkParams(
    params: Record<string, string>,
  ): modelInterfaces.ConversationChunkAttributes {
    return {
      role: params.role,
      value: params.message,
      format: params.format,
      conversationId: params.conversationId,
    };
  }

  async createConversation(
    params: Partial<modelInterfaces.ConversationAttributes>,
  ): Promise<void> {
    this.logger.logInfo(
      'createConversation - Creating a new conversation document',
    );
    const conversationDocument = await this.ConversationModel.create(params);
    this.logger.logInfo(
      `createConversation - A new conversation document has been created with id ${conversationDocument.id}`,
    );
  }

  async createConversationChunk(
    params: modelInterfaces.ConversationChunkAttributes,
  ): Promise<void> {
    await this.conversationExistByConversationId(params.conversationId);

    this.logger.logInfo(
      'createConversationChunk - Creating a new message document for an existing conversation',
    );
    const conversationChunkDocument =
      await this.ConversationChunkModel.create(params);
    this.logger.logInfo(
      `createConversationChunk - A new message document has been created with id ${conversationChunkDocument.id}`,
    );
  }

  async getConversationChunkListLean(
    conversationId: string,
  ): Promise<modelInterfaces.ConversationChunkAttributes[]> {
    await this.conversationExistByConversationId(conversationId);

    this.logger.logInfo(
      `getConversationChunkListLean - Trying to get all the messages of a conversation by the conversationId ${conversationId}`,
    );
    return this.ConversationChunkModel.find(
      { conversationId },
      { _id: 0, updatedAt: 0 },
    ).lean();
  }
}
