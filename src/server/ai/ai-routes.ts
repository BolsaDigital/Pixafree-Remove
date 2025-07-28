import { Hono } from 'hono';

import { isLoggedIn } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import aiSchema from './ai-schema';
import aiServices from './ai-services';

const aiRouter = new Hono()
  .post('/remove-image-bg', isLoggedIn, async (c) => {
    const user = c.get('user');
    const result = await aiServices.removeImageBackground(c, user?.id);

    return c.json(result);
  })
  .post(
    '/unlock-premium-download/:id',
    isLoggedIn,
    zValidator('param', aiSchema.unlockPremiumSchema),
    async (c) => {
      const user = c.get('user');
      const id = await c.req.param('id');
      const result = await aiServices.unlockPremiumDownload(id, user?.id);

      return c.json(result);
    },
  );

export default aiRouter;
