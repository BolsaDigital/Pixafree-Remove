import prisma from '@/config/prisma';
import { stripeClient } from '@/config/stripe';
import { SubscriptionStatus } from '@prisma/client';
import { Context, Env } from 'hono';
import httpStatus from 'http-status';
import Stripe from 'stripe';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { secondsToDateTime } from '@/lib/utils';

import settingServices from '../settings/setting-services';
import subscriptionServices from '../subscriptions/subscription-services';
import userServices from '../users/user-services';
import billingSchema from './billing-schema';

const stripeCheckout = async (
  userId: string,
  body: z.infer<typeof billingSchema.stripeCheckoutSessionSchema>,
) => {
  const subscription = await subscriptionServices.getUserSubscription(userId);
  if (subscription && subscription.status === 'active') {
    throw new APIError('Already has an active subscription');
  }

  const user = await userServices.getUserById(userId);
  if (!user) {
    throw new APIError('User not found');
  }

  const settings = await settingServices.getSettings('billing');
  if (!settings) {
    throw new APIError('Please set up billing configuration');
  }

  const { priceId, successUrl, cancelUrl } = body;

  if (settings?.billingProvider !== 'stripe') {
    throw new APIError('Billing provider is not Stripe');
  }

  if (!settings?.stripeSecretKey) {
    throw new APIError('Stripe secret key is not set');
  }

  const stripe = stripeClient(settings.stripeSecretKey);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
    });
    if (!customer.id) {
      throw new APIError('Failed to create Stripe customer');
    }
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customer.id },
    });
  }

  const session = await stripe.checkout.sessions.create({
    allow_promotion_codes: true,
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  if (!session.id) {
    throw new APIError('Failed to create Stripe checkout session');
  }

  return {
    sessionId: session.id,
  };
};

const createStripePortal = async (userId: string) => {
  const user = await userServices.getUserById(userId);
  if (!user) {
    throw new APIError('User not found');
  }

  const settings = await settingServices.getSettings('billing');
  if (settings?.billingProvider !== 'stripe') {
    throw new APIError('Billing provider is not Stripe');
  }

  if (!settings?.stripeSecretKey) {
    throw new APIError('Stripe secret key is not set');
  }

  const stripe = stripeClient(settings.stripeSecretKey);

  if (!user.stripeCustomerId) {
    throw new APIError('User does not have a Stripe customer ID');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile/?tab=billing`,
  });

  return {
    url: session.url,
  };
};

const updateStripeSubscription = async (customerId: string, subscriptionId: string) => {
  const settings = await settingServices.getSettings('billing');
  if (!settings?.stripeSecretKey) {
    throw new APIError('Stripe secret key is not set');
  }

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });
  if (!user) {
    throw new APIError('User not found');
  }

  const stripe = stripeClient(settings.stripeSecretKey);

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!subscription) {
    throw new APIError('Failed to retrieve subscription');
  }

  const status =
    subscription.status === 'active' || subscription.status === 'trialing'
      ? SubscriptionStatus.active
      : SubscriptionStatus.inactive;
  const currentPeriodStart = subscription.current_period_start;
  const currentPeriodEnd = subscription.current_period_end;

  const prodId =
    typeof subscription.items.data[0].price.product === 'string'
      ? subscription.items.data[0].price.product
      : subscription.items.data[0].price.product.id;
  if (!prodId) {
    throw new APIError('Plan ID is missing');
  }

  const plan = await prisma.billingPlan.findFirst({
    where: { productId: prodId },
  });
  if (!plan) {
    throw new APIError('Plan not found');
  }

  await subscriptionServices.updateSubscription({
    userId: user.id,
    planId: plan.id,
    status,
    currentPeriodStart: secondsToDateTime(currentPeriodStart),
    currentPeriodEnd: secondsToDateTime(currentPeriodEnd),
  });
};

const stripeWebhook = async (c: Context<Env, string>) => {
  try {
    const sig = c.req.header('stripe-signature');
    const payload = await c.req.text();
    const settings = await settingServices.getSettings('billing');

    if (!sig) {
      throw new APIError('Missing Stripe signature');
    }

    if (!settings?.stripeWebhookSecret) {
      throw new APIError('Stripe webhook secret is not set');
    }

    if (!settings?.stripeSecretKey) {
      throw new APIError('Stripe secret key is not set');
    }

    const stripe = stripeClient(settings.stripeSecretKey);

    const event = stripe.webhooks.constructEvent(payload, sig, settings.stripeWebhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      if (session.mode === 'subscription') {
        const customerId =
          typeof session.customer === 'string' ? session.customer : session?.customer?.id || '';
        if (!customerId) {
          throw new APIError('Customer ID is missing');
        }
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session?.subscription?.id || '';
        if (!subscriptionId) {
          throw new APIError('Subscription ID is missing');
        }
        await updateStripeSubscription(customerId, subscriptionId);
      }
    }
    const subscriptionEvents = [
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'customer.subscription.paused',
      'customer.subscription.resumed',
    ];
    if (subscriptionEvents.includes(event.type)) {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId =
        typeof subscription.customer === 'string'
          ? subscription.customer
          : subscription?.customer?.id || '';
      if (!customerId) {
        throw new APIError('Customer ID is missing');
      }
      const subscriptionId = subscription.id;
      if (!subscriptionId) {
        throw new APIError('Subscription ID is missing');
      }
      await updateStripeSubscription(customerId, subscriptionId);
    }
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    console.error('Error processing Stripe webhook:', error);
    throw new APIError('Failed to process webhook', httpStatus.INTERNAL_SERVER_ERROR);
  }
};

export default {
  stripeCheckout,
  createStripePortal,
  stripeWebhook,
};
