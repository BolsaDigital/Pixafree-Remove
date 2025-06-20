import { z } from 'zod';

import { commonPaginationSchema } from '@/lib/schema';

const postsQuerySchema = commonPaginationSchema;

const deletePostsSchema = z.object({
  ids: z.array(z.string().nonempty()).min(1),
});

const createPostSchema = z.object({
  title: z.string().nonempty('Title is required'),
  slug: z.string().nonempty('Slug is required'),
  excerpt: z.string().optional(),
  thumbnail: z.string().optional(),
  publishedAt: z.coerce.date(),
  content: z.string().nonempty('Content is required'),
  tags: z.array(z.string()).optional(),
});

export default { postsQuerySchema, deletePostsSchema, createPostSchema };
