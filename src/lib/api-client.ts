import { hc } from 'hono/client';
// ¡CORRECCIÓN CLAVE! Importa el tipo AppType desde el nuevo archivo de definición.
import type { AppType } from '@/types/hono-api';

// Define la URL base para el cliente Hono.
// Usa una variable de entorno si está disponible, de lo contrario, usa '/api'.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// ¡CORRECCIÓN CLAVE! Pasa el tipo AppType directamente a hc.
// Esto fuerza a TypeScript a inferir los tipos de la API de forma explícita
// y robusta, resolviendo el problema de 'unknown' o 'never'.
export const apiClient = hc<AppType>(BASE_URL);
