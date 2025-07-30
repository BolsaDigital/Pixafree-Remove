import authSchema from '@/server/auth/auth-schema'; // Importa el default export
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';
// Ya no necesitamos importar ApiTypes ni AppType aquí, ya que apiClient está correctamente tipado desde api-client.ts

const signup = async (body: z.infer<typeof authSchema.signUpSchema>) => {
  // apiClient ahora debería estar correctamente tipado
  const response = await apiClient.auth.signup.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const login = async (body: z.infer<typeof authSchema.loginSchema>) => { // Usamos loginSchema
  // apiClient ahora debería estar correctamente tipado
  const response = await apiClient.auth.login.$post({
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
  // apiClient ahora debería estar correctamente tipado
  const response = await apiClient.auth.logout.$post();

  if (!response.ok) {
    const data = await response.json();
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return true;
};

const forgotPassword = async (body: z.infer<typeof authSchema.forgotPasswordSchema>) => {
  // apiClient ahora debería estar correctamente tipado
  const response = await apiClient.auth['forgot-password'].$post({
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
  // apiClient ahora debería estar correctamente tipado
  const response = await apiClient.auth['reset-password'].$post({
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
