import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import StorageSettings from '../_components/storage-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - Storage - ${settings?.general.applicationName || ''}`,
  };
}

const StorageSettingsPage = () => {
  return <StorageSettings />;
};

export default StorageSettingsPage;
