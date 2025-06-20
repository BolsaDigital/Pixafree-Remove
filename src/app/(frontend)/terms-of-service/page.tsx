import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Terms Of Service - ${settings?.general?.applicationName || ''}`,
  };
}

const TermsOfServicePage = async () => {
  const legal = await settingServices.getSettings('legal');

  return (
    <div className="container !max-w-[800px] py-16 sm:py-24">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <div>
        <div
          className="prose dark:prose-invert mt-10"
          dangerouslySetInnerHTML={{ __html: legal?.termsOfService || '' }}
        />
      </div>
    </div>
  );
};

export default TermsOfServicePage;
