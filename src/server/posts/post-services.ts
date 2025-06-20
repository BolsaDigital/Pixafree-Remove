import prisma from '@/config/prisma';
import { Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { toSlug } from '@/lib/utils';

import postSchema from './post-schema';

const getPostById = async (id: string) => {
  return prisma.post.findUnique({
    where: {
      id,
    },
    include: {
      tags: true,
    },
  });
};

const getPostBySlug = async (slug: string, isPublic?: boolean) => {
  return prisma.post.findUnique({
    where: {
      slug,
      publishedAt: isPublic ? { lte: new Date() } : undefined,
    },
    include: {
      tags: true,
    },
  });
};

const createPost = async (body: z.infer<typeof postSchema.createPostSchema>) => {
  const post = await getPostBySlug(body.slug);
  if (post) {
    throw new APIError('Post already exists');
  }

  const newPost = await prisma.post.create({
    data: {
      ...body,
      tags: {
        connectOrCreate: (body.tags || []).map((tag) => ({
          where: {
            slug: toSlug(tag),
          },
          create: {
            name: tag,
            slug: toSlug(tag),
          },
        })),
      },
    },
  });

  return newPost;
};

const updatePost = async (id: string, body: z.infer<typeof postSchema.createPostSchema>) => {
  const post = await getPostById(id);
  if (!post) {
    throw new APIError('Post not found', httpStatus.NOT_FOUND);
  }

  if (body.slug && body.slug !== post.slug) {
    const postBySlug = await getPostBySlug(body.slug);
    if (postBySlug && postBySlug.id !== id) {
      throw new APIError('Post already exists');
    }
  }

  const updatePost = await prisma.post.update({
    where: {
      id,
    },
    data: {
      ...body,
      tags: {
        disconnect: post.tags,
        connectOrCreate: (body.tags || []).map((tag) => ({
          where: {
            slug: toSlug(tag),
          },
          create: {
            name: tag,
            slug: toSlug(tag),
          },
        })),
      },
    },
  });

  return updatePost;
};

const deletePosts = async (ids: string[]) => {
  await prisma.post.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

const queryPosts = async (query: z.infer<typeof postSchema.postsQuerySchema>) => {
  const { page, limit, search, sort, order } = query;

  const where: Prisma.PostWhereInput = {
    ...(search && {
      title: {
        contains: search,
        mode: 'insensitive',
      },
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.post.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
      include: {
        tags: true,
      },
    }),
    prisma.post.count({
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

const publicPosts = async (query: z.infer<typeof postSchema.postsQuerySchema>) => {
  const { page, limit, search } = query;

  const where: Prisma.PostWhereInput = {
    publishedAt: {
      lte: new Date(),
    },
    ...(search && {
      title: {
        contains: search,
        mode: 'insensitive',
      },
    }),
  };

  const [docs, total] = await Promise.all([
    prisma.post.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        tags: true,
      },
    }),
    prisma.post.count({
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

export type PublicPostsResponse = Awaited<ReturnType<typeof publicPosts>>;
export type Post = NonNullable<Awaited<ReturnType<typeof getPostBySlug>>>;

export default {
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePosts,
  queryPosts,
  publicPosts,
};
