import mediaSchema from '@/server/media/media-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema>) => {
  // Aplicar parse de Zod para asegurar que los defaults se apliquen y los tipos sean correctos
  // Esto garantiza que 'sort' y 'order' serán siempre string y SortOrder, respectivamente.
  const parsedQuery = mediaSchema.mediaQuerySchema.parse(query);

  const response = await apiClient.api.media.$get({
    query: {
      search: parsedQuery.search,
      page: parsedQuery.page,
      limit: parsedQuery.limit,
      sort: parsedQuery.sort,
      order: parsedQuery.order,
      userId: parsedQuery.userId,
      libraryMedia: parsedQuery.libraryMedia,
      isCustomBackground: parsedQuery.isCustomBackground,
      isPremium: parsedQuery.isPremium,
    } as any, // Mantenemos 'as any' aquí como último recurso si apiClient.$get es demasiado genérico.
               // El tipo de 'parsedQuery' ya es seguro.
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
