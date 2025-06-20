import { UserRole } from '@prisma/client';
import { z } from 'zod';

import { commonPaginationSchema, imageSchema, passwordSchema } from '@/lib/schema';

const usersQuerySchema = commonPaginationSchema.merge(
  z.object({
    role: z.string().optional(),
    emailVerified: z.string().optional(),
  }),
);

const deleteUsersSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

const createUserSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email(),
  password: passwordSchema,
  role: z.nativeEnum(UserRole),
  emailVerified: z.boolean(),
});

const updateUserSchema = z.object({
  name: z.string().nonempty('Name is required'),
  email: z.string().email(),
  role: z.nativeEnum(UserRole),
  emailVerified: z.boolean(),
});

const updateProfileSchema = z.object({
  name: z.string().nonempty('Name is required'),
  avatar: imageSchema.optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export default {
  usersQuerySchema,
  deleteUsersSchema,
  createUserSchema,
  updateUserSchema,
  updateProfileSchema,
  updatePasswordSchema,
};
