import { apiClient } from '@/lib/api-client';
import { ApiTypes } from '@/app/api/[[...route]]/route'; // Importa ApiTypes para la aserción de tipo

const unlockPremium = async (id: string) => {
  // Añade una aserción de tipo explícita para apiClient.api
  // Esto le dice a TypeScript que confíe en que 'api' tiene la estructura de ApiTypes['api']
  // y, por lo tanto, la propiedad 'ai' existe.
  const response = await (apiClient.api as ApiTypes['api']).ai['unlock-premium-download'][':id'].$post({
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
