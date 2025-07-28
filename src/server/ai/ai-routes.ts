import { Hono } from 'hono';

import { isLoggedIn } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import aiSchema from './ai-schema';
import aiServices from './ai-services'; // Asegúrate de que diga 'ai-services'

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
      const id = c.req.param('id'); // Ya está validado por zValidator
      const result = await aiServices.unlockPremiumDownload(id, user?.id);

      return c.json(result);
    },
  )
  .post('/generate-scene', isLoggedIn, async (c) => {
    const user = c.get('user');
    const formData = await c.req.formData(); // Hono puede parsear FormData
    const prompt = formData.get('prompt') as string;
    const referenceImageFile = formData.get('referenceImage') as File | null;

    if (!prompt) {
      throw new APIError('Prompt is required for scene generation.');
    }

    let referenceImageBase64: string | undefined;
    if (referenceImageFile) {
      // Convertir File a base64 string para pasarlo al servicio si el modelo lo requiere.
      // Actualmente, el modelo de Replicate en ai-services.ts solo usa el prompt de texto.
      // Si usaras un modelo image-to-image, esta base64 sería relevante.
      const arrayBuffer = await referenceImageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      referenceImageBase64 = `data:${referenceImageFile.type};base64,${buffer.toString('base64')}`;
    }

    try {
      // Llama al nuevo servicio de generación de escenas
      const result = await aiServices.generateScene(prompt, referenceImageBase64, user?.id);
      return c.json(result);
    } catch (error) {
      console.error('Error generating scene:', error);
      // Asegúrate de que APIError o un mensaje de error genérico sea devuelto
      throw new APIError((error as Error).message || 'Failed to generate scene.');
    }
  });

export default aiRouter;
