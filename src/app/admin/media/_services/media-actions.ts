import mediaSchema from '@/server/media/media-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema>) => {
  const response = await apiClient.api.media.$get({
    // Eliminar 'as any' y asegurar que el tipo de 'query' sea compatible
    // El tipo de 'query' ya es z.infer<typeof mediaSchema.mediaQuerySchema>,
    // que incluye los defaults para sort y order, haciéndolos string.
    query: {
      search: query.search,
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      order: query.order,
      userId: query.userId,
      libraryMedia: query.libraryMedia,
      isCustomBackground: query.isCustomBackground,
      isPremium: query.isPremium,
    } as any, // Mantener 'as any' aquí es un último recurso si el tipo de apiClient.$get.query es muy genérico.
               // Idealmente, apiClient debería inferir los tipos de la API de Hono.
               // Si sigue fallando, podríamos necesitar un tipo más preciso para el query del apiClient.
               // Por ahora, lo dejamos así para ver si la remoción del 'as any' en el nivel superior ayuda.
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const deleteMedia = async (ids: string[]) => {
  const response = await apiClient.api.media.$delete({
    json: { ids },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  queryMedia,
  deleteMedia,
};