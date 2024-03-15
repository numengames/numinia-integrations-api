import { HttpError } from '../types/errors';

const environmentList = ['production', 'dev'];

export interface ILogger {
  logInfo: (message: any, labels?: Record<string, unknown>) => void
  logError: (message: any, error?: Error|HttpError) => void
}

export default (title: string): ILogger => {
  function logInfo(message: string, options?: Record<string, unknown>): void {
    if (environmentList.includes(process.env.NODE_ENV || '')) {
      console.info({
        discord: false,
        ...options,
        message: `${title} - ${message}`,
        labels: options && options.labels ? { ...options.labels } : { message },
      });
    }
  }
  
  function logError(message: string, error?: Error|HttpError): void {
    if (environmentList.includes(process.env.NODE_ENV || '')) {
      console.error({
        error,
        labels: (<HttpError>error) ? { ...(<HttpError>error) } : { message },
      });
    }
  }
  
  return { logInfo, logError };
};
