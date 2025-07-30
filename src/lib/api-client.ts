import { hc } from 'hono/client';
import type { ApiTypes } from '@/app/api/[[...route]]/route';

// Define la URL base para el cliente Hono.
// Usa una variable de entorno si está disponible, de lo contrario, usa '/api'.
// Asegúrate de que esta URL coincida con el basePath definido en route.ts.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Crea el cliente Hono y fuerza su tipo a ApiTypes.
// Esto ayuda a TypeScript a entender la estructura de las rutas y métodos disponibles.
export const apiClient = hc(BASE_URL) as ApiTypes;
