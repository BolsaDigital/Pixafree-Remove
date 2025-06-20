import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import AiSettings from '../_components/ai-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - AI - ${settings?.general.applicationName || ''}`,
  };
}

const AiSettingsPage = () => {
  return <AiSettings />;
};

export default AiSettingsPage;
