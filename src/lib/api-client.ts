import { ApiTypes } from '@/app/api/[[...route]]/route';
import { hc } from 'hono/client';

export const apiClient = hc<ApiTypes>(process.env.NEXT_PUBLIC_BASE_URL as string);
