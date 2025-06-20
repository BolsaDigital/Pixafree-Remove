import prisma from '@/config/prisma';
import { Prisma, SubscriptionStatus } from '@prisma/client';
import moment from 'moment';
import { z } from 'zod';

import APIError from '@/lib/api-error';

import creditServices from '../credits/credit-services';
import planServices from '../plans/plan-services';
import subscriptionSchema from './subscription-schema';

const querySubscriptions = async (
  query: z.infer<typeof subscriptionSchema.subscriptionsQuerySchema>,
) => {
  const { page, limit, sort, order, status } = query;

  const where: Prisma.SubscriptionWhereInput = {
    ...(status && {
      currentPeriodEnd: {
        ...(status === 'active' && {
          gte: moment().toDate(),
        }),
        ...(status === 'inactive' && {
          lte: moment().toDate(),
        }),
      },
    }),
    ...(status && {
      status: {
        in: status.split(',').map((s) => s) as SubscriptionStatus[],
      },
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.subscription.count({
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

const updateSubscription = async ({
  userId,
  planId,
  status,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}) => {
  const isActive = status === 'active' && moment().isBetween(currentPeriodStart, currentPeriodEnd);
  if (isActive) {
    const plan = await planServices.getPlanById(planId);
    if (!plan) {
      throw new APIError('Plan not found');
    }
    await creditServices.updateCredits(userId, 'paid', plan.credits);
  }

  const existingSubscription = await prisma.subscription.findUnique({
    where: {
      userId,
    },
  });
  if (existingSubscription) {
    return prisma.subscription.update({
      where: {
        userId,
      },
      data: {
        planId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
      },
    });
  }

  return prisma.subscription.create({
    data: {
      userId,
      planId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
    },
  });
};

const getUserSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findUnique({
    where: {
      userId,
      status: 'active',
    },
    include: {
      plan: true,
    },
  });

  if (
    !subscription ||
    !moment().isBetween(subscription.currentPeriodStart, subscription.currentPeriodEnd)
  ) {
    return null;
  }

  return subscription;
};

export default {
  getUserSubscription,
  updateSubscription,
  querySubscriptions,
};
