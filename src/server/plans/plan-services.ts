import prisma from '@/config/prisma';
import { Prisma } from '@prisma/client';
import httpsStatus from 'http-status';
import { z } from 'zod';

import APIError from '@/lib/api-error';

import { getSettings } from '../settings/setting-services';
import planSchema from './plan-schema';

const getPlanById = async (id: string) => {
  return prisma.billingPlan.findUnique({
    where: {
      id,
    },
  });
};

const createPlan = async (body: z.infer<typeof planSchema.createPlanSchema>) => {
  const settings = await getSettings('billing');

  if (
    settings?.billingProvider === 'stripe' &&
    (!body.productId || !body.monthlyPriceId || !body.yearlyPriceId)
  ) {
    throw new APIError('Product id and price ids are required for Stripe');
  }

  const plan = await prisma.billingPlan.create({
    data: body,
  });

  return plan;
};

const updatePlan = async (id: string, body: z.infer<typeof planSchema.createPlanSchema>) => {
  const plan = await getPlanById(id);
  if (!plan) {
    throw new APIError('Plan not found', httpsStatus.NOT_FOUND);
  }
  const settings = await getSettings('billing');

  if (
    settings?.billingProvider === 'stripe' &&
    (!body.productId || !body.monthlyPriceId || !body.yearlyPriceId)
  ) {
    throw new APIError('Product id and price ids are required for Stripe');
  }

  const updatePlan = await prisma.billingPlan.update({
    where: {
      id,
    },
    data: body,
  });

  return updatePlan;
};

const deletePlans = async (ids: string[]) => {
  await prisma.billingPlan.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

const queryPlans = async (query: z.infer<typeof planSchema.plansQuerySchema>) => {
  const { page, limit, search, sort, order, status } = query;

  const where: Prisma.BillingPlanWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }),
    ...(status && {
      status,
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.billingPlan.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.billingPlan.count({
      where,
    }),
  ]);

  const pagination = {
    page,
    limit,
    totalDocs: total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    docs,
    pagination,
  };
};

const getPricingPlans = async () => {
  const response = await prisma.billingPlan.findMany({
    where: {
      status: 'active',
    },
    orderBy: {
      position: 'asc',
    },
  });

  return response;
};

export type Plan = NonNullable<Awaited<ReturnType<typeof getPlanById>>>;

export default {
  getPlanById,
  createPlan,
  updatePlan,
  deletePlans,
  queryPlans,
  getPricingPlans,
};
