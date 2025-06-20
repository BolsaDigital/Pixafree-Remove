import { z } from 'zod';

import { passwordSchema } from '@/lib/schema';

const signUpSchema = z.object({
  name: z.string().nonempty('Name is required').min(3, 'Name must be at least 3 characters'),
  email: z.string().nonempty('Email is required').email('Email is not valid'),
  password: passwordSchema,
});

const loginSchema = z.object({
  email: z.string().nonempty('Email is required').email('Email is not valid'),
  password: passwordSchema,
});

const verifySchema = z.object({
  token: z.string().nonempty('Token is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().nonempty('Email is required').email('Email is not valid'),
});

const resetPasswordSchema = z.object({
  token: z.string().nonempty('Token is required'),
  password: passwordSchema,
});

export default {
  signUpSchema,
  loginSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
