import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import AdvanceSettings from '../_components/advance-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - Advance - ${settings?.general.applicationName || ''}`,
  };
}

const AdvanceSettingsPage = () => {
  return <AdvanceSettings />;
};

export default AdvanceSettingsPage;
