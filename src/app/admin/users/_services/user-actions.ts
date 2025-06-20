import userSchema from '@/server/users/user-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryUsers = async (query: z.infer<typeof userSchema.usersQuerySchema>) => {
  const response = await apiClient.api.users.$get({
    query: query as any,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const deleteUsers = async (ids: string[]) => {
  const response = await apiClient.api.users.$delete({
    json: { ids },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const getUser = async (id: string) => {
  const response = await apiClient.api.users[':id'].$get({
    param: {
      id,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const createUser = async (body: z.infer<typeof userSchema.createUserSchema>) => {
  const response = await apiClient.api.users.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const updateUser = async (id: string, body: z.infer<typeof userSchema.updateUserSchema>) => {
  const response = await apiClient.api.users[':id'].$put({
    param: {
      id,
    },
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
  queryUsers,
  deleteUsers,
  getUser,
  createUser,
  updateUser,
};
