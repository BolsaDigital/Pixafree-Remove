import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import { UpdatePasswordForm } from './_components/change-password';
import { ProfileForm } from './_components/profile-form';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Profile - ${settings?.general.applicationName || ''}`,
  };
}

function AdminProfilePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground mt-1">Update your profile information</p>
      </div>
      <ProfileForm />
      <hr className="my-10" />
      <UpdatePasswordForm />
    </div>
  );
}

export default AdminProfilePage;
