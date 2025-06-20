import { PlanStatus } from '@prisma/client';
import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';

const plansQuerySchema = commonPaginationSchema.extend({
  status: z.nativeEnum(PlanStatus).optional(),
});

const deletePlansSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

const createPlanSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().optional(),
  monthlyPrice: z
    .number({
      required_error: 'Price is required',
    })
    .min(0, 'Price must be greater than or equal to 0'),
  yearlyPrice: z
    .number({
      required_error: 'Price is required',
    })
    .min(0, 'Price must be greater than or equal to 0'),
  productId: z.string().optional(),
  monthlyPriceId: z.string().optional(),
  yearlyPriceId: z.string().optional(),
  features: z.string().nonempty('Features are required'),
  status: z.nativeEnum(PlanStatus),
  position: z.number({
    required_error: 'Position is required',
  }),
  credits: z
    .number({
      required_error: 'Credits is required',
    })
    .min(0, 'Credits must be greater than or equal to 0'),
  isPopular: z.boolean().optional(),
});

export default { plansQuerySchema, deletePlansSchema, createPlanSchema };
