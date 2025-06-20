import { z } from 'zod';
const stripeCheckoutSessionSchema = z.object({
  priceId: z.string(),
  successUrl: z.string(),
  cancelUrl: z.string(),
});

export default { stripeCheckoutSessionSchema };
