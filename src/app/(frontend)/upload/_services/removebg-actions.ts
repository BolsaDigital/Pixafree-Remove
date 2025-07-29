import { apiClient } from '@/lib/api-client';
// No necesitamos ApiTypes aquí si la inferencia de apiClient es correcta
// import { ApiTypes } from '@/app/api/[[...route]]/route';

const unlockPremium = async (id: string) => {
  // Con la corrección en route.ts (ApiTypes = typeof app),
  // apiClient.api.ai debería inferirse correctamente sin aserción explícita.
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
