import { apiClient } from '@/lib/api-client';

const adminStats = async () => {
  const response = await apiClient.api.common['admin-stats'].$get();

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  adminStats,
};
