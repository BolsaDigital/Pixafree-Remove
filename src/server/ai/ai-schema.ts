import { z } from 'zod';

export const removeBgSchema = z.object({
  image: z.instanceof(File),
});

export const unlockPremiumSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const generateSceneSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  referenceImageBase64: z.string().optional(), // Base64 de la imagen de referencia (opcional)
});

// Exporta todos los esquemas para que puedan ser importados como un objeto
export default {
  removeBgSchema,
  unlockPremiumSchema,
  generateSceneSchema,
};
