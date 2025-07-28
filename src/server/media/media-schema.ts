import { z } from 'zod';

const mediaQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(10),
  sort: z.string().optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  userId: z.string().optional(),
  libraryMedia: z.coerce.boolean().optional(), // Asegúrate de que esto también se valide
  isCustomBackground: z.coerce.boolean().optional(), // Añadido
  isPremium: z.coerce.boolean().optional(), // Añadido
});

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
  isCustomBackground: z.coerce.boolean().optional().default(false), // Añadido
  isPremium: z.coerce.boolean().optional().default(false), // Añadido
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