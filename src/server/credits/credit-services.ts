import prisma from '@/config/prisma';
import { CreditsType } from '@prisma/client';
import moment from 'moment';

import settingServices from '../settings/setting-services';
import subscriptionServices from '../subscriptions/subscription-services';

const getCredits = async (userId: string, type: CreditsType) => {
  const credits = await prisma.credits.findFirst({
    where: {
      userId,
      type,
    },
  });

  return credits;
};

const updateCredits = async (userId: string, type: CreditsType, credits: number) => {
  const month = moment().format('YYYY-MM');
  const creditsData = await prisma.credits.findFirst({
    where: {
      userId,
      type,
      month,
    },
  });
  if (creditsData) {
    const updatedCredits = await prisma.credits.update({
      where: {
        id: creditsData.id,
      },
      data: {
        credits: credits,
      },
    });

    return updatedCredits;
  } else {
    const newCredits = await prisma.credits.create({
      data: {
        userId,
        type,
        credits,
        month,
      },
    });

    return newCredits;
  }
};

const getUserCredits = async (userId: string) => {
  const subscription = await subscriptionServices.getUserSubscription(userId);
  const month = moment().format('YYYY-MM');
  let creditsCount = 0;
  let usedCount = 0;
  let activeCreditsId = null;
  if (subscription && subscription.status === 'active') {
    const credits = await prisma.credits.findFirst({
      where: {
        userId,
        type: 'paid',
        month,
      },
    });

    if (credits) {
      creditsCount = credits.credits;
      usedCount = credits.used;
      activeCreditsId = credits.id;
    } else {
      const planCredits = subscription.plan.credits;
      const creditsData = await prisma.credits.create({
        data: {
          userId,
          type: 'paid',
          credits: planCredits,
          used: 0,
          month,
        },
      });

      if (creditsData) {
        creditsCount = creditsData.credits;
        usedCount = creditsData.used;
        activeCreditsId = creditsData.id;
      }
    }
  } else {
    const credits = await prisma.credits.findFirst({
      where: {
        userId,
        type: 'free',
        month,
      },
    });

    if (credits) {
      creditsCount = credits.credits;
      usedCount = credits?.used;
      activeCreditsId = credits.id;
    } else {
      const settings = await settingServices.getSettings('advanced');
      const creditsData = await prisma.credits.create({
        data: {
          userId,
          type: 'free',
          credits: settings?.freeCredits || 0,
          month,
        },
      });

      if (creditsData) {
        creditsCount = creditsData.credits;
        usedCount = creditsData.used;
        activeCreditsId = creditsData.id;
      }
    }
  }

  const finalCredits = creditsCount - usedCount > 0 ? creditsCount - usedCount : 0;

  return {
    credits: finalCredits,
    id: activeCreditsId,
  };
};

export default {
  getCredits,
  getUserCredits,
  updateCredits,
};
