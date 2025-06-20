import { SettingsDataMap, SettingsKey } from '@/server/settings/setting-schema';

import { apiClient } from '@/lib/api-client';

const getSettings = async <T extends SettingsKey>(key: T): Promise<SettingsDataMap[T] | null> => {
  const response = await apiClient.api.settings[':key'].$get({
    param: {
      key,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap[T];
};

const getPublicSettings = async () => {
  const response = await apiClient.api.settings.$get();

  const data = await response.json();
  if (!response.ok) {
    return null;
  }

  return data;
};

const saveGeneralSettings = async (body: SettingsDataMap['general']) => {
  const response = await apiClient.api.settings.general.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['general'];
};

const saveUploadSettings = async (body: SettingsDataMap['upload']) => {
  const response = await apiClient.api.settings.upload.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['upload'];
};

const saveMailSettings = async (body: SettingsDataMap['mail']) => {
  const response = await apiClient.api.settings.mail.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['mail'];
};

const saveBillingSettings = async (body: SettingsDataMap['billing']) => {
  const response = await apiClient.api.settings.billing.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['billing'];
};

const saveAdvanceSettings = async (body: SettingsDataMap['advanced']) => {
  const response = await apiClient.api.settings.advance.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['advanced'];
};

const saveAiSettings = async (body: SettingsDataMap['ai']) => {
  const response = await apiClient.api.settings.ai.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['ai'];
};

const saveLegalSettings = async (body: SettingsDataMap['legal']) => {
  const response = await apiClient.api.settings.legal.$put({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data as SettingsDataMap['legal'];
};

const deleteOldFiles = async () => {
  const response = await apiClient.api.common['cleanup-old-files'].$get();

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  getSettings,
  getPublicSettings,
  saveGeneralSettings,
  saveUploadSettings,
  saveMailSettings,
  saveBillingSettings,
  saveAdvanceSettings,
  saveAiSettings,
  saveLegalSettings,
  deleteOldFiles,
};
