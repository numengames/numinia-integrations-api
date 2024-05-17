import { Router } from 'express';
import { loggerHandler } from '@numengames/numinia-logger';

import MonitRoutes from './routes/monit.routes';
import OpenAIRoutes from './routes/openai.routes';
import DiscordRoutes from './routes/discord.routes';
import ConversationRoutes from './routes/conversation.routes';

export default () => {
  const router = Router();

  router.use('/monit', new MonitRoutes(loggerHandler).router);
  router.use('/openai', new OpenAIRoutes(loggerHandler).router);
  router.use('/discord', new DiscordRoutes(loggerHandler).router);
  router.use('/conversation', new ConversationRoutes(loggerHandler).router);

  return router;
};
