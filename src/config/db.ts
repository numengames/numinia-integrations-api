import { TMongoConfig } from './types';
import { connect as modelConnect } from '@numengames/numinia-models';

export default {
  connect: ({
    protocol,
    user,
    pass,
    host,
    port,
    databaseName,
    options,
  }: TMongoConfig): void => {
    if (process.env.NODE_ENV !== 'test') {
      const userPass = user && pass ? `${user}:${pass}@` : '';

      const uri = `${protocol}://${userPass}${host}${(process.env.NODE_ENV === 'dev' && ':' + port) || ''}/${databaseName}?retryWrites=true&w=majority`;

      modelConnect(uri, options);
    }
  },
};
