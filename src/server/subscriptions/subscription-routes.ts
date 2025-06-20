import { Hono } from 'hono';

import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import subscriptionSchema from './subscription-schema';
import subscriptionServices from './subscription-services';

const subscriptionRouter = new Hono().get(
  '/',
  isAdmin,
  zValidator('query', subscriptionSchema.subscriptionsQuerySchema),
  async (c) => {
    const query = c.req.valid('query');

    const subscriptions = await subscriptionServices.querySubscriptions(query);

    return c.json(subscriptions);
  },
);

export default subscriptionRouter;
