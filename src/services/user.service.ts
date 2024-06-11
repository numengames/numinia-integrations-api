import { Model } from 'mongoose';
import { interfaces as modelInterfaces } from '@numengames/numinia-models';
import { interfaces as loggerInterfaces } from '@numengames/numinia-logger';

export interface IUserService {
  getUserFromWalletId(
    walletId: string,
  ): Promise<modelInterfaces.UserAttributes | null>;
}

interface UserServiceConstructor {
  loggerHandler: (title: string) => loggerInterfaces.ILogger;
  UserModel: Model<modelInterfaces.UserAttributes>;
}

export default class UserService implements IUserService {
  private readonly logger: loggerInterfaces.ILogger;

  private readonly UserModel: Model<modelInterfaces.UserAttributes>;

  constructor({ UserModel, loggerHandler }: UserServiceConstructor) {
    this.UserModel = UserModel;
    this.logger = loggerHandler('ConversationService');
  }

  async getUserFromWalletId(
    walletId: string,
  ): Promise<modelInterfaces.UserAttributes | null> {
    this.logger.logInfo(
      `getUserFromWalletId - Trying to get an user by the walletId ${walletId}`,
    );
    return this.UserModel.findOne(
      { wallet: walletId },
      { updatedAt: 0 },
    ).lean();
  }
}
