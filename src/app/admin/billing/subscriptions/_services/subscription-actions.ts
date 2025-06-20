import subscriptionSchema from '@/server/subscriptions/subscription-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const querySubscriptions = async (
  query: z.infer<typeof subscriptionSchema.subscriptionsQuerySchema>,
) => {
  const response = await apiClient.api.subscriptions.$get({
    query: query as any,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  querySubscriptions,
};
