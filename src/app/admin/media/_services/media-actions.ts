import mediaSchema from '@/server/media/media-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema>) => {
  const response = await apiClient.api.media.$get({
    query: query as any,
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
