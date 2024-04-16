export type TLoggerConfig = {
  loki: {
    job: string,
    user: string,
    host: string,
    password: string,
    isActive: boolean,
  },
  discord: {
    webhook: string,
    service: string,
    isActive: boolean,
  }
}

export type TBaseConfig = {
  port: number,
  openAIToken: string,
  logger: TLoggerConfig,
}