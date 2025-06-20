import { Hono } from 'hono';

import { isAuthenticated } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import authSchema from './auth-schema';
import authServices from './auth-services';

const authRouter = new Hono()
  .post('/signup', zValidator('json', authSchema.signUpSchema), async (c) => {
    const body = c.req.valid('json');
    await authServices.signup(body);

    return c.json({
      message: 'Signup successfully. Please check your email to verify your account.',
    });
  })
  .post('/login', zValidator('json', authSchema.loginSchema), async (c) => {
    const body = c.req.valid('json');
    const user = await authServices.login(body);

    await authServices.createUserSession(user.id, c);

    return c.json(authServices.cleanupUserResponse(user));
  })
  .post('/logout', isAuthenticated, async (c) => {
    await authServices.logout(c);

    return c.json({
      message: 'Logout successfully.',
    });
  })
  .get('/verify', zValidator('query', authSchema.verifySchema), async (c) => {
    const { token } = c.req.valid('query');
    const user = await authServices.verifyEmail(token);

    await authServices.createUserSession(user.id, c);

    return c.json(authServices.cleanupUserResponse(user));
  })
  .post('/forgot-password', zValidator('json', authSchema.forgotPasswordSchema), async (c) => {
    const { email } = c.req.valid('json');
    await authServices.forgotPassword(email);

    return c.json({
      message: 'Please check your email to reset your password.',
    });
  })
  .post('/reset-password', zValidator('json', authSchema.resetPasswordSchema), async (c) => {
    const { token, password } = c.req.valid('json');
    const user = await authServices.resetPassword(token, password);

    await authServices.createUserSession(user.id, c);

    return c.json(authServices.cleanupUserResponse(user));
  });

export default authRouter;
