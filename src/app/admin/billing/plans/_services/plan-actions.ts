import planSchema from '@/server/plans/plan-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryPlans = async (query: z.infer<typeof planSchema.plansQuerySchema>) => {
  const response = await apiClient.api.plans.$get({
    query: query as any,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const deletePlans = async (ids: string[]) => {
  const response = await apiClient.api.plans.$delete({
    json: { ids },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const getPlan = async (id: string) => {
  const response = await apiClient.api.plans[':id'].$get({
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

const createPlan = async (body: z.infer<typeof planSchema.createPlanSchema>) => {
  const response = await apiClient.api.plans.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const updatePlan = async (id: string, body: z.infer<typeof planSchema.createPlanSchema>) => {
  const response = await apiClient.api.plans[':id'].$put({
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
  queryPlans,
  deletePlans,
  getPlan,
  createPlan,
  updatePlan,
};
