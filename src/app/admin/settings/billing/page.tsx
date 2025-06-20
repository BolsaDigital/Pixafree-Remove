import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import BillingSettings from '../_components/billing-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Settings - Billing - ${settings?.general.applicationName || ''}`,
  };
}

const BillingSettingsPage = () => {
  return <BillingSettings />;
};

export default BillingSettingsPage;
