import postSchema from '@/server/posts/post-schema';
import { z } from 'zod';

import { apiClient } from '@/lib/api-client';

const queryPosts = async (query: z.infer<typeof postSchema.postsQuerySchema>) => {
  const response = await apiClient.api.posts.$get({
    query: query as any,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const deletePosts = async (ids: string[]) => {
  const response = await apiClient.api.posts.$delete({
    json: { ids },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const getPost = async (id: string) => {
  const response = await apiClient.api.posts[':id'].$get({
    param: {
      id,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const createPost = async (body: z.infer<typeof postSchema.createPostSchema>) => {
  const response = await apiClient.api.posts.$post({
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

const updatePost = async (id: string, body: z.infer<typeof postSchema.createPostSchema>) => {
  const response = await apiClient.api.posts[':id'].$put({
    param: {
      id,
    },
    json: body,
  });

  const data = await response.json();
  if (!response.ok) {
    const error = data as unknown as { message: string };
    throw new Error(error.message);
  }

  return data;
};

export default {
  queryPosts,
  deletePosts,
  getPost,
  createPost,
  updatePost,
};
