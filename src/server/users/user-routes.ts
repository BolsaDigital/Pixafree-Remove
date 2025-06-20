import { Hono } from 'hono';
import httpStatus from 'http-status';

import APIError from '@/lib/api-error';
import { isAuthenticated, isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import creditServices from '../credits/credit-services';
import subscriptionServices from '../subscriptions/subscription-services';
import userSchema from './user-schema';
import userServices from './user-services';

const userRouter = new Hono()
  .get('/me', isAuthenticated, async (c) => {
    const user = c.get('user');

    return c.json(user);
  })
  .get('/me/credits', isAuthenticated, async (c) => {
    const user = c.get('user');
    const credits = await creditServices.getUserCredits(user.id);

    return c.json(credits);
  })
  .get('/me/subscription', isAuthenticated, async (c) => {
    const user = c.get('user');
    const subscriptions = await subscriptionServices.getUserSubscription(user.id);

    return c.json(subscriptions);
  })
  .get('/', isAdmin, zValidator('query', userSchema.usersQuerySchema), async (c) => {
    const query = c.req.valid('query');

    const users = await userServices.queryUsers(query);

    return c.json(users);
  })
  .get('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const user = await userServices.getUserById(id);

    if (!user) {
      throw new APIError('User not found', httpStatus.NOT_FOUND);
    }

    return c.json(user);
  })
  .post('/', isAdmin, zValidator('json', userSchema.createUserSchema), async (c) => {
    const users = c.req.valid('json');
    await userServices.createUser(users);

    return c.json({ message: 'User created successfully' });
  })
  .put('/me', isAuthenticated, zValidator('form', userSchema.updateProfileSchema), async (c) => {
    const body = c.req.valid('form');
    const user = c.get('user');
    await userServices.updateProfile(user.id, body);

    return c.json({ message: 'Profile updated successfully' });
  })
  .put(
    '/me/password',
    isAuthenticated,
    zValidator('json', userSchema.updatePasswordSchema),
    async (c) => {
      const body = c.req.valid('json');
      const user = c.get('user');
      await userServices.updatePassword(user.id, body);

      return c.json({ message: 'Password updated successfully' });
    },
  )
  .put('/:id', isAdmin, zValidator('json', userSchema.updateUserSchema), async (c) => {
    const users = c.req.valid('json');
    const id = c.req.param('id');
    await userServices.updateUser(id, users);

    return c.json({ message: 'User updated successfully' });
  })
  .delete('/', isAdmin, zValidator('json', userSchema.deleteUsersSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await userServices.deleteUsers(ids);

    return c.json({ message: 'Users deleted successfully' });
  });

export default userRouter;
