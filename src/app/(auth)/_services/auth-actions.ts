import authSchema from '@/server/auth/auth-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const signup = async (body: z.infer<typeof authSchema.signUpSchema>) => {
  const response = await apiClient.api.auth.signup.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const login = async (body: z.infer<typeof authSchema.loginSchema>) => {
  const response = await apiClient.api.auth.login.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const logout = async () => {
  const response = await apiClient.api.auth.logout.$post();

  if (!response.ok) {
    const data = await response.json();
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return true;
};

const forgotPassword = async (body: z.infer<typeof authSchema.forgotPasswordSchema>) => {
  const response = await apiClient.api.auth['forgot-password'].$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const resetPassword = async (body: z.infer<typeof authSchema.resetPasswordSchema>) => {
  const response = await apiClient.api.auth['reset-password'].$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
