import { z } from 'zod';

const unlockPremiumSchema = z.object({
  id: z.string().nonempty(),
});

// Nuevo esquema para la generación de escenas
const generateSceneInputSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  // La imagen de referencia se enviará como un archivo en FormData,
  // pero si la pasáramos como base64 en JSON, este sería el tipo.
  // Para Hono con FormData, la validación se hará en la ruta.
  // Aquí solo definimos la estructura lógica.
});

const aiSchema = {
  unlockPremiumSchema,
  generateSceneInputSchema, // Añadido
};

export default aiSchema;
