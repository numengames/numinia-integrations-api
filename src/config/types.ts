export type TMongoConfig = {
  protocol: string;
  host: string;
  port: string;
  hasPort: boolean;
  databaseName: string;
  options: {
    replicaSet: string;
  };
  user: string;
  pass: string;
};

export type TJWTConfig = {
  issuer: string;
  secret: string;
  saltRounds: number;
};

export type TLoggerConfig = {
  loki: {
    job: string;
    user: string;
    host: string;
    password: string;
    isActive: boolean;
  };
  discord: {
    webhook: string;
    service: string;
    isActive: boolean;
  };
};

export type TBaseConfig = {
  port: number;
  mongo: TMongoConfig;
  jwt: TJWTConfig;
  openAIToken: string;
  logger: TLoggerConfig;
};
