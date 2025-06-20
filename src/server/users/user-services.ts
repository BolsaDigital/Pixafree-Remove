import prisma from '@/config/prisma';
import { Prisma, UserRole } from '@prisma/client';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { hash, verifyHash } from '@/lib/crypto';

import mediaServices from '../media/media-services';
import userSchema from './user-schema';

const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    },
  });
};

const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
  });
};

const createUser = async (body: z.infer<typeof userSchema.createUserSchema>) => {
  const user = await getUserByEmail(body.email);
  if (user) {
    throw new APIError('User already exists');
  }

  // Hash password
  const hashedPassword = await hash(body.password);

  return prisma.user.create({
    data: {
      ...body,
      password: hashedPassword,
    },
  });
};

const updateUser = async (id: string, body: z.infer<typeof userSchema.updateUserSchema>) => {
  const user = await getUserById(id);
  if (!user) {
    throw new APIError('User not found');
  }

  if (body.email && body.email !== user.email) {
    const existingUser = await getUserByEmail(body.email);
    if (existingUser && existingUser.id !== id) {
      throw new APIError('Email already exists');
    }
  }

  if (user.role === 'admin' && body.role && body.role !== 'admin') {
    const fetchAdmins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
    });
    if (fetchAdmins.length === 1) {
      throw new APIError('Cannot remove last admin');
    }
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: body,
  });
};

const updateProfile = async (id: string, body: z.infer<typeof userSchema.updateProfileSchema>) => {
  const user = await getUserById(id);
  if (!user) {
    throw new APIError('User not found');
  }

  let avatar;
  if (body.avatar) {
    const media = await mediaServices.uploadMedia(body.avatar, id);
    avatar = media.url;
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      name: body.name,
      avatar,
    },
  });
};

const updatePassword = async (
  id: string,
  body: z.infer<typeof userSchema.updatePasswordSchema>,
) => {
  const user = await getUserById(id);
  if (!user) {
    throw new APIError('User not found');
  }

  const isPasswordValid = await verifyHash(body.currentPassword, user.password);
  if (!isPasswordValid) {
    throw new APIError('Invalid current password');
  }

  const hashedPassword = await hash(body.newPassword);

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      password: hashedPassword,
    },
  });
};

const deleteUsers = async (ids: string[]) => {
  const users = await prisma.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
  if (users.length === 0) {
    throw new APIError('No users found');
  }

  if (users.some((user) => user.role === 'admin')) {
    const fetchAdmins = await prisma.user.findMany({
      where: {
        role: 'admin',
      },
    });
    if (fetchAdmins.length === 1) {
      throw new APIError('Cannot remove last admin');
    }
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

const queryUsers = async (query: z.infer<typeof userSchema.usersQuerySchema>) => {
  const { page, limit, search, sort, order, role, emailVerified } = query;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ],
    }),
    ...(role && {
      role: {
        in: role.split(',') as UserRole[],
      },
    }),
    ...(emailVerified && {
      OR: emailVerified.split(',').map((v) => ({
        emailVerified: Boolean(v),
      })),
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.user.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.user.count({
      where,
    }),
  ]);

  const pagination = {
    page,
    limit,
    totalDocs: total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    docs,
    pagination,
  };
};

export default {
  getUserById,
  getUserByEmail,
  createUser,
  updateProfile,
  updatePassword,
  updateUser,
  deleteUsers,
  queryUsers,
};
