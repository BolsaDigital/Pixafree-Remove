import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import SubscriptionsTable from './_components/subscriptions-table';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Subscriptions - ${settings?.general.applicationName || ''}`,
  };
}

const SubscriptionsPage = () => {
  return <SubscriptionsTable />;
};

export default SubscriptionsPage;
