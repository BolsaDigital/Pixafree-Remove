import { z } from 'zod';

const mediaQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  sort: z.string().optional().default('createdAt'), // Default makes it string at runtime
  order: z.enum(['asc', 'desc']).optional().default('desc'), // Default makes it 'asc' | 'desc' at runtime
  userId: z.string().optional(),
  libraryMedia: z.coerce.boolean().optional(),
  isCustomBackground: z.coerce.boolean().optional(),
  isPremium: z.coerce.boolean().optional(),
});

// Nuevo tipo para la query después de que Zod ha aplicado los valores por defecto
// Esto garantiza que 'sort' y 'order' siempre serán definidos.
export type MediaParsedQuerySchema = z.infer<typeof mediaQuerySchema> & {
  sort: string;
  order: 'asc' | 'desc';
};

const mediaCreateSchema = z.object({
  name: z.string(),
  mimeType: z.string(),
  size: z.coerce.number(),
  storageType: z.string(),
  url: z.string().url(),
  fileName: z.string(),
  key: z.string(),
  userId: z.string().optional(),
  libraryMedia: z.coerce.boolean().optional().default(false),
  isCustomBackground: z.coerce.boolean().optional().default(false),
  isPremium: z.coerce.boolean().optional().default(false),
});

const deleteMediaSchema = z.object({
  ids: z.array(z.string()),
});

const mediaSchema = {
  mediaQuerySchema,
  mediaCreateSchema,
  deleteMediaSchema,
};

export default mediaSchema;
