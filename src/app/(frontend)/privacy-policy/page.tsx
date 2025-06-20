import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Privacy Policy - ${settings?.general?.applicationName || ''}`,
  };
}

const PrivacyPolicyPage = async () => {
  const legal = await settingServices.getSettings('legal');

  return (
    <div className="container !max-w-[800px] py-16 sm:py-24">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <div>
        <div
          className="prose dark:prose-invert mt-10"
          dangerouslySetInnerHTML={{ __html: legal?.privacyPolicy || '' }}
        />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
