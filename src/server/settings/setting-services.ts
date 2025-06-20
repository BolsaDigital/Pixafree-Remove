import prisma from '@/config/prisma';

import { SettingsKey, SettingsDataMap } from './setting-schema';

export const getSettings = async <K extends SettingsKey>(
  key: K,
): Promise<SettingsDataMap[K] | null> => {
  const result = await prisma.setting.findFirst({
    where: { key },
  });

  if (!result) {
    return null;
  }

  return result.value as SettingsDataMap[K];
};

export const saveSettings = async <K extends SettingsKey>(
  key: K,
  body: SettingsDataMap[K],
): Promise<SettingsDataMap[K]> => {
  const settings = await prisma.setting.upsert({
    where: { key },
    update: { value: body },
    create: { key, value: body },
  });

  return settings.value as SettingsDataMap[K];
};

export const publicSettings = async () => {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        in: ['general', 'billing', 'advanced'],
      },
    },
  });

  const general =
    (settings.find((setting) => setting.key === 'general')?.value as SettingsDataMap['general']) ||
    null;
  const billing =
    (settings.find((setting) => setting.key === 'billing')?.value as SettingsDataMap['billing']) ||
    null;
  const advanced =
    (settings.find((setting) => setting.key === 'advanced')
      ?.value as SettingsDataMap['advanced']) || null;

  const publicSettings = {
    general: {
      applicationName: general?.applicationName || null,
      siteTitle: general?.siteTitle || null,
      siteDescription: general?.siteDescription || null,
      siteKeywords: general?.siteKeywords || null,
      logo: general?.logo || null,
      darkLogo: general?.darkLogo || null,
      iconLogo: general?.iconLogo || null,
      iconLogoDark: general?.iconLogoDark || null,
      favicon: general?.favicon || null,
      coverImage: general?.coverImage || null,
    },
    billing: {
      billingProvider: billing?.billingProvider || null,
      billingMode: billing?.billingMode || null,
      currency: billing?.currency || null,
      stripePublishableKey: billing?.stripePublishableKey || null,
    },
    advanced: {
      freeCredits: advanced?.freeCredits || null,
    },
  };

  return publicSettings;
};

export type PublicSettings = Awaited<ReturnType<typeof publicSettings>>;

export default {
  saveSettings,
  getSettings,
  publicSettings,
};
