import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import PostsTable from './_components/posts-table';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Posts - ${settings?.general.applicationName || ''}`,
  };
}

const PostsPage = () => {
  return <PostsTable />;
};

export default PostsPage;
