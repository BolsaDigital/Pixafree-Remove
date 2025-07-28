import { Hono } from 'hono';

import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import mediaSchema from './media-schema';
import mediaServices from './media-services';

const mediaRouter = new Hono()
  .get('/', isAdmin, zValidator('query', mediaSchema.mediaQuerySchema), async (c) => {
    const query = c.req.valid('query');
    // Asegúrate de que isCustomBackground y isPremium se pasen correctamente desde la query
    // zValidator ya los parseará si están en mediaQuerySchema
    const media = await mediaServices.queryMedia(query);

    return c.json(media);
  })
  .get('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const media = await mediaServices.getMedia(id);

    return c.json(media);
  })
  .post('/', isAdmin, async (c) => {
    // Leer FormData directamente desde Hono
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const isCustomBackground = formData.get('isCustomBackground') === 'true';
    const isPremium = formData.get('isPremium') === 'true';
    // Asumiendo que el userId se obtiene de la sesión si es necesario en mediaServices.createMedia
    // o que se pasa desde el frontend si es un campo opcional.
    // Aquí, lo pasamos como undefined si no lo necesitas en el backend para esta ruta.
    const userId = undefined; // O c.get('user').id si tienes un middleware de autenticación que lo añade al contexto

    const media = await mediaServices.createMedia(file, isCustomBackground, isPremium, userId);

    return c.json(media);
  })
  .put('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    // Leer FormData para updateMedia
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    // Si updateMedia necesita isCustomBackground/isPremium para actualizar, extráelos aquí
    // const isCustomBackground = formData.get('isCustomBackground') === 'true';
    // const isPremium = formData.get('isPremium') === 'true';

    const media = await mediaServices.updateMedia(id, file); // Pasa solo el archivo por ahora

    return c.json(media);
  })
  .delete('/', isAdmin, zValidator('json', mediaSchema.deleteMediaSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await mediaServices.deleteMedia(ids);

    return c.json({ message: 'Media deleted successfully' });
  });
export default mediaRouter;
