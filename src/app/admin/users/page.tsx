import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import UsersTable from './_components/users-table';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Users - ${settings?.general.applicationName || ''}`,
  };
}

const UsersPage = () => {
  return <UsersTable />;
};

export default UsersPage;
