import planServices from '@/server/plans/plan-services';
import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import { FaqSection } from '../_components/faqs';
import PricingGrid from './_components/pricing-grid';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Pricing - ${settings?.general?.applicationName || ''}`,
  };
}

const PricingPage = async () => {
  const plans = await planServices.getPricingPlans();

  return (
    <div className="py-16 sm:py-24 space-y-16 sm:space-y-24">
      <PricingGrid plans={plans} />
      <FaqSection />
    </div>
  );
};

export default PricingPage;
