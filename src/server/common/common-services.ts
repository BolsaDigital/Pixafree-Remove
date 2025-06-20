import prisma from '@/config/prisma';
import moment from 'moment';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { deleteMediaFile } from '@/lib/uploader';

import settingServices from '../settings/setting-services';
import userServices from '../users/user-services';
import commonSchema from './common-schema';

const adminStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [usersCount, activeSubscriptions, todayImagesProcessed, todayCreditsUsed] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'active' } }),
      prisma.history.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.history.count({
        where: {
          createdAt: {
            gte: todayStart,
          },
          unlocked: true,
        },
      }),
    ]);

  return {
    usersCount,
    activeSubscriptions,
    todayImagesProcessed,
    todayCreditsUsed,
  };
};

const cleanupOldFiles = async () => {
  const files = await prisma.history.findMany({
    where: {
      createdAt: {
        lte: moment().subtract(24, 'hours').toDate(),
      },
    },
    include: {
      inputMedia: true,
      outputMedia: true,
      previewMedia: true,
    },
  });

  files.forEach(async (file) => {
    if (file.inputMedia) {
      await deleteMediaFile(file.inputMedia);
    }
    if (file.outputMedia) {
      await deleteMediaFile(file.outputMedia);
    }
    if (file.previewMedia) {
      await deleteMediaFile(file.previewMedia);
    }
    await prisma.history.delete({
      where: {
        id: file.id,
      },
    });
  });
};

const setupApp = async (body: z.infer<typeof commonSchema.setupAppSchema>) => {
  const user = await prisma.user.findFirst();
  if (user) {
    throw new APIError('Setup already completed');
  }

  const { applicationName, adminEmail, adminPassword } = body;

  await userServices.createUser({
    name: 'Admin',
    email: adminEmail,
    password: adminPassword,
    emailVerified: true,
    role: 'admin',
  });

  await settingServices.saveSettings('general', {
    applicationName: applicationName,
    siteTitle: '',
    siteDescription: '',
  });

  await settingServices.saveSettings('upload', {
    uploadProvider: 'local',
    maxFileSize: 5,
    maxFileSizeType: 'mb',
  });

  await settingServices.saveSettings('advanced', {
    freeCredits: 5,
  });
};

const checkSetup = async () => {
  const user = await prisma.user.findFirst();
  if (user) {
    return true;
  }

  return false;
};

export default {
  adminStats,
  cleanupOldFiles,
  setupApp,
  checkSetup,
};
