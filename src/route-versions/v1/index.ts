import { Router } from 'express';
import MonitRoutes from './routes/monit.routes';
import DiscordRoutes from './routes/discord.routes';

export default () => {
  const router = Router();

  router.use('/monit', new MonitRoutes().router);
  router.use('/discord', new DiscordRoutes().router);

  return router;
};