// src/types/hono-api.ts
// Este archivo define el tipo de tu aplicación Hono
// para ser usado por el cliente Hono (hc) en el frontend.

// Importa la instancia de la aplicación Hono desde el archivo de rutas.
// Aunque 'app' se define en un archivo de servidor, aquí solo extraemos su tipo.
import { app } from '@/app/api/[[...route]]/route';

// Exporta el tipo de la aplicación Hono.
// Este tipo incluye todas las rutas y métodos definidos en tu API.
export type AppType = typeof app;
