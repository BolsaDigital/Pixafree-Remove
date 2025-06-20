import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';

const subscriptionsQuerySchema = commonPaginationSchema.extend({
  status: z.string().optional(),
});

export default { subscriptionsQuerySchema };
