import { Hono } from 'hono';

import { isAuthenticated } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import billingSchema from './billing-schema';
import billingServices from './billing-services';

const billingRouter = new Hono()
  .post(
    '/stripe/checkout',
    isAuthenticated,
    zValidator('json', billingSchema.stripeCheckoutSessionSchema),
    async (c) => {
      const body = c.req.valid('json');
      const user = c.get('user');
      const plan = await billingServices.stripeCheckout(user.id, body);

      return c.json(plan);
    },
  )
  .get('/stripe/portal', isAuthenticated, async (c) => {
    const user = c.get('user');
    const portal = await billingServices.createStripePortal(user.id);

    return c.json(portal);
  })
  .post('/stripe/webhook', async (c) => {
    await billingServices.stripeWebhook(c);

    return c.json({ received: true });
  });

export default billingRouter;
