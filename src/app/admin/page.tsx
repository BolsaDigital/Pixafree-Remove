import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import LatestSubscriptions from './_components/latest-subscriptions';
import LatestUsers from './_components/latest-users';
import AdminStats from './_components/stats';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Dashboard - ${settings?.general.applicationName || ''}`,
  };
}

const OverviewPage = () => {
  return (
    <div className="space-y-5">
      <h1 className="font-bold text-2xl">Dashboard</h1>
      <div className="space-y-8">
        <AdminStats />
        <LatestSubscriptions />
        <LatestUsers />
      </div>
    </div>
  );
};

export default OverviewPage;
