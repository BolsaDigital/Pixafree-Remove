import { LOCAL_MEDIA_PREFIX, LOCAL_UPLOAD_DIR } from '@/config/constants';
import aiRouter from '@/server/ai/ai-routes';
import authRouter from '@/server/auth/auth-routes';
import billingRouter from '@/server/billing/billing-routes';
import commonRouter from '@/server/common/common-routes';
import mediaRouter from '@/server/media/media-routes';
import planRouter from '@/server/plans/plan-routes';
import postRouter from '@/server/posts/post-routes';
import settingRouter from '@/server/settings/setting-routes';
import subscriptionRouter from '@/server/subscriptions/subscription-routes';
import userRouter from '@/server/users/user-routes';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { serveStatic } from 'hono/serve-static';
import { handle } from 'hono/vercel';
import httpStatus from 'http-status';
import path from 'path';

import APIError from '@/lib/api-error';
import { getFileByPath } from '@/lib/file'; // Corregido: de '=>' a 'from'

// Create Hono app with base path /api
const app = new Hono().basePath('/api');

// Enable compression, CORS, and secure headers
app.use(compress());
app.use(cors());
app.use(secureHeaders());

// static files
app.use(
  `/${LOCAL_MEDIA_PREFIX}/*`,
  serveStatic({
    async getContent(p, c) {
      const fileName = p.split('/').pop();
      if (!fileName) {
        return null;
      }
      const filePath = path.join(process.cwd(), LOCAL_UPLOAD_DIR, fileName);

      const file = await getFileByPath(filePath);

      if (!file) {
        return null;
      }

      c.header('Content-Type', file.mime);
      c.header('Cache-Control', 'public, max-age=31536000');
      c.header('Content-Length', file.size.toString());
      c.header('Content-Disposition', `attachment; filename="${fileName}"`);

      return c.body(file.data);
    },
  }),
);

// Define routes and error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route('/auth', authRouter)
  .route('/users', userRouter)
  .route('/settings', settingRouter)
  .route('/media', mediaRouter)
  .route('/posts', postRouter)
  .route('/plans', planRouter)
  .route('/billing', billingRouter)
  .route('/subscriptions', subscriptionRouter)
  .route('/ai', aiRouter)
  .route('/common', commonRouter)
  // Return 404 if route not found
  .notFound((c) => {
    return c.json(
      {
        message: 'Not found',
        code: httpStatus.NOT_FOUND,
      },
      httpStatus.NOT_FOUND,
    );
  })
  // Handle errors
  .onError((err, c) => {
    if (err instanceof APIError) {
      return c.json(
        {
          message: err.message,
          code: err.code,
        },
        err.code,
      );
    }
    console.error(err);

    return c.json(
      {
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        code: httpStatus.INTERNAL_SERVER_ERROR,
      },
      httpStatus.INTERNAL_SERVER_ERROR,
    );
  });

// Export handlers for all HTTP methods
export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const OPTIONS = handle(app);
export const DELETE = handle(app);

// ¡CORRECCIÓN CLAVE! Exporta la instancia 'app' directamente.
// Esto es crucial para que hono/client pueda referenciarla y generar tipos.
export { app };
