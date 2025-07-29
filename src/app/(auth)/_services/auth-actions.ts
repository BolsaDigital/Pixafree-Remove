import authSchema from '@/server/auth/auth-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';
import { ApiTypes } from '@/app/api/[[...route]]/route'; // Importa ApiTypes

const signup = async (body: z.infer<typeof authSchema.signUpSchema>) => {
  // ¡CORRECCIÓN CLAVE! Aserción de tipo explícita para apiClient
  const response = await (apiClient as ApiTypes).api.auth.signup.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const login = async (body: z.infer<typeof authSchema.signInSchema>) => {
  // ¡CORRECCIÓN CLAVE! Aserción de tipo explícita para apiClient
  const response = await (apiClient as ApiTypes).api.auth.login.$post({
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
  // ¡CORRECCIÓN CLAVE! Aserción de tipo explícita para apiClient
  const response = await (apiClient as ApiTypes).api.auth.logout.$post();

  if (!response.ok) {
    const data = await response.json();
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return true;
};

const forgotPassword = async (body: z.infer<typeof authSchema.forgotPasswordSchema>) => {
  // ¡CORRECCIÓN CLAVE! Aserción de tipo explícita para apiClient
  const response = await (apiClient as ApiTypes).api.auth['forgot-password'].$post({
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
  // ¡CORRECCIÓN CLAVE! Aserción de tipo explícita para apiClient
  const response = await (apiClient as ApiTypes).api.auth['reset-password'].$post({
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
