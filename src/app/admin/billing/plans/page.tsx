import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import PlansTable from './_components/plans-table';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Plans - ${settings?.general.applicationName || ''}`,
  };
}

const PlansPage = () => {
  return <PlansTable />;
};

export default PlansPage;
