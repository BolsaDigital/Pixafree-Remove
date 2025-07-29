import { apiClient } from '@/lib/api-client';
import { ApiTypes } from '@/app/api/[[...route]]/route'; // Importa ApiTypes para la aserción de tipo

const unlockPremium = async (id: string) => {
  // ¡CORRECCIÓN CLAVE: Se ha eliminado el '.api' extra!
  // Ahora se accede directamente a 'ai' en apiClient.
  const response = await (apiClient as ApiTypes).ai['unlock-premium-download'][':id'].$post({
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
