import { Hono } from 'hono';

import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import commonSchema from './common-schema';
import commonServices from './common-services';

const commonRouter = new Hono()
  .get('/admin-stats', isAdmin, async (c) => {
    const stats = await commonServices.adminStats();

    return c.json(stats);
  })
  .get('/cleanup-old-files', isAdmin, async (c) => {
    await commonServices.cleanupOldFiles();

    return c.json({
      message: 'Old files cleaned up successfully',
    });
  })
  .post('/setup', zValidator('json', commonSchema.setupAppSchema), async (c) => {
    const body = c.req.valid('json');
    await commonServices.setupApp(body);

    return c.json({
      message: 'Setup completed successfully',
    });
  });

export default commonRouter;
