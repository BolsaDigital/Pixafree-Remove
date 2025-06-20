import postServices from '@/server/posts/post-services';
import settingServices from '@/server/settings/setting-services';
import { Metadata } from 'next';
import React, { cache } from 'react';

import { Badge } from '@/components/ui/badge';

import { FaqSection } from '../_components/faqs';
import PostsGrid from './_components/posts-grid';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Blog - ${settings?.general?.applicationName || ''}`,
  };
}

type tSearchParams = Promise<{
  page?: string;
}>;

const PricingPage = async ({ searchParams }: { searchParams: tSearchParams }) => {
  const { page } = await searchParams;
  const postsData = await postServices.publicPosts({ page: parseInt(page || '1', 10), limit: 9 });

  if (!postsData) {
    return (
      <div className="container py-20">
        <div className="mb-14 flex flex-col items-center">
          <Badge className="mb-6" variant="secondary">
            Latest Updates
          </Badge>
          <h1 className="text-4xl font-bold text-center">Blog Posts</h1>
          <p className="text-lg text-muted-foreground mt-2 text-center">
            Discover our latest articles and insights on various topics.
          </p>
        </div>
        <div className="flex justify-center items-center h-screen">
          <p>Failed to load posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 sm:py-24 space-y-16 sm:space-y-24">
      <div className="container">
        <div className="mb-14 flex flex-col items-center">
          <Badge className="mb-6" variant="secondary">
            Latest Updates
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold text-center">Blog Posts</h1>
          <p className="text-sm md:text-lg text-muted-foreground mt-2 text-center">
            Discover our latest articles and insights on various topics.
          </p>
        </div>
        <PostsGrid postsData={postsData} />
      </div>
      <FaqSection />
    </div>
  );
};

export default PricingPage;
