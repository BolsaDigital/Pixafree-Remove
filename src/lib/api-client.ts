import { hc } from 'hono/client';
import { Hono } from 'hono'; // Importar Hono para crear una instancia dummy
// Importar los routers del servidor para la inferencia de tipos
import authRouter from '@/server/auth/auth-routes';
import userRouter from '@/server/users/user-routes';
import settingRouter from '@/server/settings/setting-routes';
import mediaRouter from '@/server/media/media-routes';
import postRouter from '@/server/posts/post-routes';
import planRouter from '@/server/plans/plan-routes';
import billingRouter from '@/server/billing/billing-routes';
import subscriptionRouter from '@/server/subscriptions/subscription-routes';
import aiRouter from '@/server/ai/ai-routes';
import commonRouter from '@/server/common/common-routes';


// Define la URL base para el cliente Hono.
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// ¡CORRECCIÓN CLAVE!
// Creamos una instancia "dummy" de Hono en el cliente
// para que TypeScript pueda inferir la estructura de la API.
// Esto NO inicia un servidor Hono en el cliente, solo es para tipado.
const app = new Hono().basePath('/api');

// Recreamos la estructura de rutas aquí para la inferencia de tipos.
// Las rutas deben coincidir con las definidas en src/app/api/[[...route]]/route.ts
app
  .route('/auth', authRouter)
  .route('/users', userRouter)
  .route('/settings', settingRouter)
  .route('/media', mediaRouter)
  .route('/posts', postRouter)
  .route('/plans', planRouter)
  .route('/billing', billingRouter)
  .route('/subscriptions', subscriptionRouter)
  .route('/ai', aiRouter)
  .route('/common', commonRouter);

// Exporta el cliente Hono, tipado con la instancia dummy 'app'.
// Esto asegura que TypeScript conozca la estructura completa de tu API.
export const apiClient = hc<typeof app>(BASE_URL);
