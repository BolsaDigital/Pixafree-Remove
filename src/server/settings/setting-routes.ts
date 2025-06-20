import { Hono } from 'hono';

import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import settingSchema from './setting-schema';
import settingServices from './setting-services';

const settingRouter = new Hono()
  .get('/', async (c) => {
    const settings = await settingServices.publicSettings();

    return c.json(settings);
  })
  .get('/:key', isAdmin, zValidator('param', settingSchema.getSettingsValidation), async (c) => {
    const param = c.req.valid('param');
    const { key } = param;

    const settings = await settingServices.getSettings(key);

    return c.json(settings);
  })
  .put('/general', isAdmin, zValidator('json', settingSchema.generalSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('general', body);

    return c.json(settings);
  })
  .put('/upload', isAdmin, zValidator('json', settingSchema.uploadSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('upload', body);

    return c.json(settings);
  })
  .put('/mail', isAdmin, zValidator('json', settingSchema.mailSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('mail', body);

    return c.json(settings);
  })
  .put('/billing', isAdmin, zValidator('json', settingSchema.billingSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('billing', body);

    return c.json(settings);
  })
  .put('/advance', isAdmin, zValidator('json', settingSchema.advancedSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('advanced', body);

    return c.json(settings);
  })
  .put('/ai', isAdmin, zValidator('json', settingSchema.aiSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('ai', body);

    return c.json(settings);
  })
  .put('/legal', isAdmin, zValidator('json', settingSchema.legalSettingsSchema), async (c) => {
    const body = c.req.valid('json');

    const settings = await settingServices.saveSettings('legal', body);

    return c.json(settings);
  });

export default settingRouter;
