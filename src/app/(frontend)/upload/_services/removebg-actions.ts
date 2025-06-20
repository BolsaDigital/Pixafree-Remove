import { apiClient } from '@/lib/api-client';

const unlockPremium = async (id: string) => {
  const response = await apiClient.api.ai['unlock-premium-download'][':id'].$post({
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

export default {
  unlockPremium,
};
