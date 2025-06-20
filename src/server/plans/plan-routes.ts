import { Hono } from 'hono';
import httpStatus from 'http-status';

import APIError from '@/lib/api-error';
import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import planSchema from './plan-schema';
import planServices from './plan-services';

const planRouter = new Hono()
  .get('/', isAdmin, zValidator('query', planSchema.plansQuerySchema), async (c) => {
    const query = c.req.valid('query');

    const plans = await planServices.queryPlans(query);

    return c.json(plans);
  })
  .get('/public', async (c) => {
    const plans = await planServices.getPricingPlans();

    return c.json(plans);
  })
  .get('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const plan = await planServices.getPlanById(id);

    if (!plan) {
      throw new APIError('Plan not found', httpStatus.NOT_FOUND);
    }

    return c.json(plan);
  })
  .post('/', isAdmin, zValidator('json', planSchema.createPlanSchema), async (c) => {
    const plans = c.req.valid('json');
    const plan = await planServices.createPlan(plans);

    return c.json(plan);
  })
  .put('/:id', isAdmin, zValidator('json', planSchema.createPlanSchema), async (c) => {
    const plans = c.req.valid('json');
    const id = c.req.param('id');
    const plan = await planServices.updatePlan(id, plans);

    return c.json(plan);
  })
  .delete('/', isAdmin, zValidator('json', planSchema.deletePlansSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await planServices.deletePlans(ids);

    return c.json({ message: 'Plans deleted successfully' });
  });

export default planRouter;
