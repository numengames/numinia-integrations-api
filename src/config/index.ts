export default {
  port: 8000,
  logger: {
    loki: {
      isActive: true,
      job: 'numinia-integrations-api',
      host: 'https://logs-prod-012.grafana.net',
      user: process.env.GRAFANA_LOGGER_USER || 'test',
      password: process.env.GRAFANA_LOGGER_PASSWORD || 'test',
    },
    discord: {
      isActive: true,
      service: 'numinia-integrations-api',
      webhook: process.env.DISCORD_WEBHOOK || 'test'
    }
  },
};