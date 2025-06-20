import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_OPTIONS,
  EMAIL_VERIFICATION_TOKEN_EXPIRES_IN,
  PASSWORD_RESET_TOKEN_EXPIRES_IN,
} from '@/config/constants';
import prisma from '@/config/prisma';
import { User } from '@prisma/client';
import { Context, Env } from 'hono';
import { setCookie, getCookie } from 'hono/cookie';
import { getConnInfo } from 'hono/vercel';
import httpStatus from 'http-status';
import moment from 'moment';
import * as R from 'remeda';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { hash, verifyHash, generateRandomKey } from '@/lib/crypto';
import { emailVerificationTemplate, resetPasswordTemplate } from '@/lib/email-templates';
import { sendMail } from '@/lib/nodemailer';

import settingServices from '../settings/setting-services';
import userServices from '../users/user-services';
import authSchema from './auth-schema';

const cleanupUserResponse = (user: User) => {
  return R.omit(user, [
    'password',
    'emailVerified',
    'id',
    'stripeCustomerId',
    'createdAt',
    'updatedAt',
  ]);
};

export type UserResponse = ReturnType<typeof cleanupUserResponse>;

const createUserSession = async (userId: string, c: Context<Env, string>) => {
  const expiresAt = moment().add(AUTH_COOKIE_MAX_AGE, 'seconds').toDate();
  const token = generateRandomKey();
  const userAgent = c.req.header('User-Agent');
  const { remote } = await getConnInfo(c);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      userAgent: userAgent,
      ipAddress: remote?.address,
    },
  });
  setCookie(c, 'session_token', token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
};

const sendEmailVerification = async (user: User) => {
  const token = generateRandomKey();
  const expiresAt = moment().add(EMAIL_VERIFICATION_TOKEN_EXPIRES_IN, 'seconds').toDate();

  await prisma.verification.create({
    data: {
      type: 'email_verification',
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

  const settings = await settingServices.getSettings('general');

  const { subject, html } = emailVerificationTemplate(
    verificationLink,
    user.name,
    settings?.applicationName || '',
  );

  await sendMail({
    to: user.email,
    subject,
    html,
  });
};

const signup = async (body: z.infer<typeof authSchema.signUpSchema>) => {
  // Check if email already exists
  const existingUser = await userServices.getUserByEmail(body.email);
  if (existingUser) {
    throw new APIError('Email already exists', httpStatus.CONFLICT);
  }

  // Hash password
  const hashedPassword = await hash(body.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      ...body,
      password: hashedPassword,
    },
  });

  // Send email verification
  await sendEmailVerification(user);

  return user;
};

const login = async (body: z.infer<typeof authSchema.loginSchema>) => {
  // Check if email exists
  const user = await userServices.getUserByEmail(body.email);
  if (!user) {
    throw new APIError('Invalid login credentials', httpStatus.UNAUTHORIZED);
  }

  // Verify password
  const isPasswordValid = await verifyHash(body.password, user.password);
  if (!isPasswordValid) {
    throw new APIError('Invalid login credentials', httpStatus.UNAUTHORIZED);
  }

  // check if user email is verified
  if (!user.emailVerified) {
    await sendEmailVerification(user);
    throw new APIError(
      'Please verify your email. A verification link has been sent to your email.',
      httpStatus.UNAUTHORIZED,
    );
  }

  return user;
};

const logout = async (c: Context<Env, string>) => {
  const token = getCookie(c, AUTH_COOKIE_NAME);
  if (!token) {
    throw new APIError('Unauthorized', httpStatus.UNAUTHORIZED);
  }

  await prisma.session.deleteMany({
    where: {
      token,
    },
  });

  setCookie(c, AUTH_COOKIE_NAME, '', {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
};

const verifyEmail = async (token: string) => {
  const verification = await prisma.verification.findFirst({
    where: {
      token,
      type: 'email_verification',
      expiresAt: {
        gte: moment().toDate(),
      },
    },
  });

  if (!verification) {
    throw new APIError('Invalid or expired token', httpStatus.BAD_REQUEST);
  }

  await prisma.user.update({
    where: {
      id: verification.userId,
    },
    data: {
      emailVerified: true,
    },
  });

  await prisma.verification.deleteMany({
    where: {
      userId: verification.userId,
    },
  });

  const user = await userServices.getUserById(verification.userId);
  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  return user;
};

const forgotPassword = async (email: string) => {
  const user = await userServices.getUserByEmail(email);
  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  const token = generateRandomKey();
  const expiresAt = moment().add(PASSWORD_RESET_TOKEN_EXPIRES_IN, 'seconds').toDate();

  await prisma.verification.create({
    data: {
      type: 'password_reset',
      token,
      expiresAt,
      userId: user.id,
    },
  });

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

  const settings = await settingServices.getSettings('general');

  const { subject, html } = resetPasswordTemplate(
    resetLink,
    user.name,
    settings?.applicationName || '',
  );

  await sendMail({
    to: user.email,
    subject,
    html,
  });
};

const resetPassword = async (token: string, password: string) => {
  const verification = await prisma.verification.findFirst({
    where: {
      token,
      type: 'password_reset',
      expiresAt: {
        gte: moment().toDate(),
      },
    },
  });

  if (!verification) {
    throw new APIError('Invalid or expired token', httpStatus.BAD_REQUEST);
  }

  const hashedPassword = await hash(password);

  await prisma.user.update({
    where: {
      id: verification.userId,
    },
    data: {
      password: hashedPassword,
    },
  });

  await prisma.verification.deleteMany({
    where: {
      userId: verification.userId,
    },
  });
  await prisma.session.deleteMany({
    where: {
      userId: verification.userId,
    },
  });

  const user = await userServices.getUserById(verification.userId);
  if (!user) {
    throw new APIError('User not found', httpStatus.NOT_FOUND);
  }

  return user;
};

export default {
  cleanupUserResponse,
  sendEmailVerification,
  createUserSession,
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  logout,
};
