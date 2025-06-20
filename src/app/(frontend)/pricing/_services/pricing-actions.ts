import billingSchema from '@/server/billing/billing-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const stripeCheckout = async (body: z.infer<typeof billingSchema.stripeCheckoutSessionSchema>) => {
  const response = await apiClient.api.billing.stripe.checkout.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  stripeCheckout,
};
