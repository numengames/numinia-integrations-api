import { Router } from 'express';

import logger from '../../utils/logger';
import MonitRoutes from './routes/monit.routes';
import OpenAIRoutes from './routes/openai.routes';
import DiscordRoutes from './routes/discord.routes';

export default () => {
  const router = Router();

  router.use('/monit', new MonitRoutes(logger).router);
  router.use('/openai', new OpenAIRoutes(logger).router);
  router.use('/discord', new DiscordRoutes(logger).router);

  return router;
};