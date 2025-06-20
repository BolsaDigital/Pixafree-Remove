'use client';

import { UpdatePasswordForm } from '@/app/admin/profile/_components/change-password';
import { ProfileForm } from '@/app/admin/profile/_components/profile-form';
import { useSearchParams } from '@/hooks/use-params';
import { UserResponse } from '@/server/auth/auth-services';
import React from 'react';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import PlanOverview from './plan-overview';

const ProfileTabs = ({ initialTab, user }: { initialTab?: string; user: UserResponse }) => {
  const { updateSearchParams } = useSearchParams();
  const [tab, setTab] = React.useState(initialTab || 'profile');

  return (
    <Tabs
      value={tab}
      onValueChange={(e) => {
        setTab(e);
        updateSearchParams({ tab: e });
      }}
      defaultValue="profile"
    >
      <TabsList className="mb-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="billing">Credits & Plan</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="bg-card rounded-2xl p-4 sm:p-8 border">
        <div className="max-w-[400px]">
          <ProfileForm initialUser={user} />
          <hr className="my-8" />
          <UpdatePasswordForm />
        </div>
      </TabsContent>

      <TabsContent value="billing" className="bg-card rounded-2xl p-4 sm:p-8 border">
        <PlanOverview />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
