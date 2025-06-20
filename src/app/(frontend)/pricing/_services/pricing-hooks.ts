import { useSettings } from '@/app/_providers/settings-provider';
import { loadStripe } from '@stripe/stripe-js';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import pricingActions from './pricing-actions';

const stripeClient = async (stripePublishableKey: string) => {
  if (!stripePublishableKey) {
    toast.error('Stripe Publishable Key is not defined');

    return;
  }
  const stripe = await loadStripe(stripePublishableKey);
  if (!stripe) {
    toast.error('Stripe failed to load');

    return;
  }

  return stripe;
};

export const useCheckout = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const settings = useSettings();

  const stripeCheckoutMutation = useMutation({
    mutationFn: pricingActions.stripeCheckout,
    onSuccess: async ({ sessionId }) => {
      const stripe = await stripeClient(settings?.billing?.stripePublishableKey || '');
      if (stripe) {
        stripe?.redirectToCheckout({ sessionId });
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create checkout session');
    },
  });

  const handleCheckout = async (price: string) => {
    switch (settings?.billing?.billingProvider) {
      case 'stripe': {
        stripeCheckoutMutation.mutate({
          priceId: price,
          successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/?tab=billing&billingSuccess=true`,
          cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?billingCancel=true`,
        });
        break;
      }
      default:
        toast.error('No billing provider configured');
    }
  };

  return {
    handleCheckout,
    isPending: stripeCheckoutMutation.isPending,
    selectedPlan,
    setSelectedPlan,
  };
};
