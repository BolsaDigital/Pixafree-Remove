import postServices from '@/server/posts/post-services';
import { Metadata } from 'next';
import Image from 'next/image';
import React, { cache } from 'react';

import { Badge } from '@/components/ui/badge';
import TimeFormat from '@/components/ui/time-format';

import NotFound from '../../_components/not-found';

type tParams = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: tParams }): Promise<Metadata> {
  const { slug } = await params;
  const post = await cache(postServices.getPostBySlug)(slug);

  return {
    title: post?.title || '404 - Not Found',
    description: post?.excerpt || '',
    openGraph: {
      title: post?.title || '404 - Not Found',
      description: post?.excerpt || '',
      images: post?.thumbnail ? [post.thumbnail] : [],
    },
  };
}

const BlogPostPage = async ({ params }: { params: tParams }) => {
  const { slug } = await params;
  const post = await cache(postServices.getPostBySlug)(slug);
  if (!post) {
    return <NotFound />;
  }

  return (
    <div className="container !max-w-[800px] py-12 md:py-20">
      <h1 className="text-2xl md:text-4xl font-bold">{post.title}</h1>
      <div className="flex items-center gap-4 mt-6 justify-between">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
        <p>
          <TimeFormat time={post.publishedAt} />
        </p>
      </div>
      {post.thumbnail && (
        <Image
          width={500}
          height={400}
          src={post.thumbnail}
          alt={post.title}
          className="h-auto w-full object-contain rounded-xl mt-8"
        />
      )}
      <div>
        <div
          className="prose dark:prose-invert mt-10"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </div>
  );
};

export default BlogPostPage;
