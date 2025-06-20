import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import LegalSettings from '../_components/legal-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - Legal - ${settings?.general.applicationName || ''}`,
  };
}

const LegalSettingsPage = () => {
  return <LegalSettings />;
};

export default LegalSettingsPage;
