import userSchema from '@/server/users/user-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const getProfile = async () => {
  const response = await apiClient.api.users.me.$get();

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const getCreditsInfo = async () => {
  const response = await apiClient.api.users.me.credits.$get();

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const getUserSubscription = async () => {
  const response = await apiClient.api.users.me.subscription.$get();

  const data = await response.json();
  if (!response.ok) {
    return null;
  }

  return data;
};

const updateProfile = async (data: z.infer<typeof userSchema.updateProfileSchema>) => {
  const response = await apiClient.api.users.me.$put({
    form: {
      name: data.name,
      ...(data.avatar && {
        avatar: data.avatar,
      }),
    },
  });
  const responseData = await response.json();
  if (!response.ok) {
    const error = responseData as unknown as { message: string };
    throw new Error(error.message);
  }

  return responseData;
};

const updatePassword = async (data: z.infer<typeof userSchema.updatePasswordSchema>) => {
  const response = await apiClient.api.users.me.password.$put({
    json: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    },
  });
  const responseData = await response.json();
  if (!response.ok) {
    const error = responseData as unknown as { message: string };
    throw new Error(error.message);
  }

  return responseData;
};

const getStripeCustomerPortal = async () => {
  const response = await apiClient.api.billing.stripe.portal.$get();

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export type UserSubscription = Awaited<ReturnType<typeof getUserSubscription>>;

export default {
  getProfile,
  getCreditsInfo,
  getUserSubscription,
  updateProfile,
  updatePassword,
  getStripeCustomerPortal,
};
