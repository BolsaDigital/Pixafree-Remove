import { AUTH_COOKIE_NAME } from '@/config/constants';
import prisma from '@/config/prisma';
import authServices from '@/server/auth/auth-services';
import { Context, Env, Next } from 'hono';
import httpStatus from 'http-status';
import moment from 'moment';
import { cookies } from 'next/headers';

import APIError from '../api-error';

const getUserSession = async (isAdmin?: boolean) => {
  // Get token from cookies
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  if (!token) return null;

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { token: token.value, expiresAt: { gte: moment().toDate() } },
    include: { user: true },
  });
  if (!session) return null;

  // Check if user email is verified
  const user = session.user;
  if (!user || !user.emailVerified) return null;

  // Check if user is admin
  if (isAdmin && user.role !== 'admin') return null;

  return session.user;
};

export const loggedInUser = async (isAdmin?: boolean) => {
  const user = await getUserSession(isAdmin);
  if (!user) return null;

  return authServices.cleanupUserResponse(user);
};

export const isAuthenticated = async (c: Context<Env, string>, next: Next) => {
  const user = await getUserSession();
  if (!user) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }

  c.set('user', user);

  return next();
};

export const isLoggedIn = async (c: Context<Env, string>, next: Next) => {
  const user = await getUserSession();
  if (user) {
    c.set('user', user);
  }

  return next();
};

export const isAdmin = async (c: Context<Env, string>, next: Next) => {
  const user = await getUserSession(true);
  if (!user) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }

  c.set('user', user);

  return next();
};
