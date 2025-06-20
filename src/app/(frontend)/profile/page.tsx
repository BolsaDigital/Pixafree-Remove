import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React, { cache } from 'react';

import { loggedInUser } from '@/lib/middlewares/auth';

import ProfileTabs from './_components/profile-tabs';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Profile - ${settings?.general?.applicationName || ''}`,
  };
}

type TSearchParams = Promise<{
  tab?: string;
}>;

const ProfilePage = async ({ searchParams }: { searchParams: TSearchParams }) => {
  const { tab } = await searchParams;
  const user = await loggedInUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div className="py-14 md:py-20">
      <div className="container !max-w-[800px]">
        <div className="mb-10">
          <h1 className="text-2xl md:text-4xl font-bold text-center">My Dashboard</h1>
          <p className="text-md font-medium text-center mt-3">{user.name}</p>
        </div>
        <ProfileTabs user={user} initialTab={tab} />
      </div>
    </div>
  );
};

export default ProfilePage;
