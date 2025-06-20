import { Hono } from 'hono';

import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import mediaSchema from './media-schema';
import mediaServices from './media-services';

const mediaRouter = new Hono()
  .get('/', isAdmin, zValidator('query', mediaSchema.mediaQuerySchema), async (c) => {
    const query = c.req.valid('query');

    const media = await mediaServices.queryMedia(query);

    return c.json(media);
  })
  .get('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const media = await mediaServices.getMedia(id);

    return c.json(media);
  })
  .post('/', isAdmin, async (c) => {
    const media = await mediaServices.createMedia(c);

    return c.json(media);
  })
  .put('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const media = await mediaServices.updateMedia(id, c);

    return c.json(media);
  })
  .delete('/', isAdmin, zValidator('json', mediaSchema.deleteMediaSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await mediaServices.deleteMedia(ids);

    return c.json({ message: 'Media deleted successfully' });
  });
export default mediaRouter;
