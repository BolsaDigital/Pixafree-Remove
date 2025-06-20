'use client';

import { useSettings } from '@/app/_providers/settings-provider';
import { useProfile, useUserSubscription } from '@/app/admin/profile/_services/profile-hooks';
import { Plan } from '@/server/plans/plan-services';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useCheckout } from '../_services/pricing-hooks';
import PricingCard from './pricing-card';
const parseFeatures = (features: string) => {
  return features
    .split(',')
    .map((feature) => feature.trim())
    .filter((feature) => feature !== '');
};

const calculateYearlySavings = (plans: Plan[]) => {
  if (plans.length === 0) {
    return 0;
  }

  let monthlyPrice = 0;
  let yearlyPrice = 0;

  const popularPlan = plans.find((plan) => plan.isPopular);
  if (popularPlan) {
    monthlyPrice = popularPlan.monthlyPrice;
    yearlyPrice = popularPlan.yearlyPrice;
  } else {
    const firstPlan = plans[0];
    monthlyPrice = firstPlan.monthlyPrice;
    yearlyPrice = firstPlan.yearlyPrice;
  }

  const monthlyTotal = monthlyPrice * 12;
  const yearlyTotal = yearlyPrice;
  const savings = ((monthlyTotal - yearlyTotal) / monthlyTotal) * 100;

  return Math.round(savings);
};

const PricingGrid = ({ plans }: { plans: Plan[] }) => {
  const router = useRouter();
  const { user, isLoading } = useProfile();
  const { handleCheckout, isPending, selectedPlan, setSelectedPlan } = useCheckout();
  const { subscription, isLoading: subscriptionLoading } = useUserSubscription();
  const settings = useSettings();
  const [paymentFrequency, setPaymentFrequency] = React.useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="container">
      <div className="mb-14 flex flex-col items-center">
        <Badge className="mb-6" variant="secondary">
          Pricing Plans
        </Badge>
        <h1 className="text-2xl md:text-4xl font-bold text-center">Simple, Transparent Pricing</h1>
        <p className="text-sm md:text-lg text-muted-foreground mt-2 text-center">
          Choose the perfect plan for your background removal needs. No hidden fees.
        </p>
      </div>
      <div className="mt-16">
        <div className="mb-12 flex justify-center">
          <Tabs
            value={paymentFrequency}
            onValueChange={(value) => setPaymentFrequency(value as 'monthly' | 'yearly')}
          >
            <TabsList className="rounded-full h-12 border">
              <TabsTrigger className="rounded-full px-4 h-10 text-md" value="monthly">
                Monthly
              </TabsTrigger>
              <TabsTrigger className="rounded-full px-4 h-10 text-md" value="yearly">
                Yearly{' '}
                <span className="bg-primary text-primary-foreground rounded-full ml-1 px-2 text-xs font-semibold py-0.5">
                  Save {calculateYearlySavings(plans)}%
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <PricingCard
            name="Free"
            description={`${settings?.advanced?.freeCredits || 0} credit per month for free to get started.`}
            features={[
              `${settings?.advanced?.freeCredits || 0} credits per month`,
              'Basics, at no cost',
              'Remove background',
              'Limited support',
            ]}
            price="Free"
            buttonText={user ? 'Profile' : 'Create Account'}
            disabled={isLoading || subscriptionLoading}
            paymentFrequency={paymentFrequency === 'monthly' ? 'Month' : 'Year'}
            onButtonClick={() => {
              if (user) {
                router.push('/profile/?tab=billing');
              } else {
                router.push('/signup');
              }
            }}
          />
          {plans.map((plan) => (
            <PricingCard
              key={plan.id}
              name={plan.name}
              description={plan.description || ''}
              features={parseFeatures(plan.features)}
              price={paymentFrequency === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
              paymentFrequency={paymentFrequency === 'monthly' ? 'Month' : 'Year'}
              buttonText={subscription ? 'Manage' : 'Subscribe'}
              isPopular={plan.isPopular}
              disabled={isLoading || subscriptionLoading}
              isLoading={isPending && selectedPlan === plan.id}
              onButtonClick={() => {
                if (subscription) {
                  router.push(`/profile`);
                } else if (!user) {
                  router.push('/signup');
                } else {
                  setSelectedPlan(plan.id);
                  const priceId =
                    paymentFrequency === 'monthly' ? plan.monthlyPriceId : plan.yearlyPriceId;
                  if (priceId) {
                    handleCheckout(priceId);
                  }
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingGrid;
