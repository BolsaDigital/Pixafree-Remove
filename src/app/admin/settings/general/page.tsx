import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import GeneralSettings from '../_components/general-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - General - ${settings?.general.applicationName || ''}`,
  };
}

const GeneralSettingsPage = () => {
  return <GeneralSettings />;
};

export default GeneralSettingsPage;
