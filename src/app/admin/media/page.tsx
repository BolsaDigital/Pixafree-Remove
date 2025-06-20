import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import MediaTable from './components/media-table';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Media - ${settings?.general.applicationName || ''}`,
  };
}

const MediaPage = () => {
  return <MediaTable />;
};

export default MediaPage;
