import { Hono } from 'hono';
import httpStatus from 'http-status';

import APIError from '@/lib/api-error';
import { isAdmin } from '@/lib/middlewares/auth';
import { zValidator } from '@/lib/middlewares/zodValidator';

import postSchema from './post-schema';
import postServices from './post-services';

const postRouter = new Hono()
  .get('/', isAdmin, zValidator('query', postSchema.postsQuerySchema), async (c) => {
    const query = c.req.valid('query');

    const posts = await postServices.queryPosts(query);

    return c.json(posts);
  })
  .get('/public', zValidator('query', postSchema.postsQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const posts = await postServices.publicPosts(query);

    return c.json(posts);
  })
  .get('/slug/:slug', async (c) => {
    const slug = c.req.param('slug');
    const post = await postServices.getPostBySlug(slug, true);

    if (!post) {
      throw new APIError('Post not found', httpStatus.NOT_FOUND);
    }

    return c.json(post);
  })
  .get('/:id', isAdmin, async (c) => {
    const id = c.req.param('id');
    const post = await postServices.getPostById(id);

    if (!post) {
      throw new APIError('Post not found', httpStatus.NOT_FOUND);
    }

    return c.json(post);
  })
  .post('/', isAdmin, zValidator('json', postSchema.createPostSchema), async (c) => {
    const posts = c.req.valid('json');
    const post = await postServices.createPost(posts);

    return c.json(post);
  })
  .put('/:id', isAdmin, zValidator('json', postSchema.createPostSchema), async (c) => {
    const posts = c.req.valid('json');
    const id = c.req.param('id');
    const post = await postServices.updatePost(id, posts);

    return c.json(post);
  })
  .delete('/', isAdmin, zValidator('json', postSchema.deletePostsSchema), async (c) => {
    const { ids } = c.req.valid('json');
    await postServices.deletePosts(ids);

    return c.json({ message: 'Posts deleted successfully' });
  });

export default postRouter;
