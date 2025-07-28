import mediaSchema, { MediaParsedQuerySchema } from '@/server/media/media-schema'; // Importar el nuevo tipo
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

// La función ahora espera un query que ya ha sido parseado y tiene los defaults aplicados
const queryMedia = async (query: MediaParsedQuerySchema) => {
  const response = await apiClient.api.media.$get({
    query: {
      search: query.search,
      page: query.page,
      limit: query.limit,
      sort: query.sort, // Ahora garantizado como string
      order: query.order, // Ahora garantizado como 'asc' | 'desc'
      userId: query.userId,
      libraryMedia: query.libraryMedia,
      isCustomBackground: query.isCustomBackground,
      isPremium: query.isPremium,
    } as any, // Mantenemos 'as any' aquí como último recurso si apiClient.$get es demasiado genérico.
               // El tipo de 'query' ya es seguro.
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
