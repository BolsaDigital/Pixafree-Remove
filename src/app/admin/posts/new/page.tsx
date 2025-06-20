import settingServices from '@/server/settings/setting-services';
import { ArrowLeftIcon } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { cache } from 'react';

import { Button } from '@/components/ui/button';

import CreatePostForm from '../_components/create-post';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `New Post - ${settings?.general.applicationName || ''}`,
  };
}

const CreatePostPage = () => {
  return (
    <div>
      <div className="space-y-1 pb-7 mb-7">
        <h1 className="text-2xl font-bold tracking-tight">
          <Button variant="outline" className="mr-4 size-8" asChild size="icon">
            <Link href="/admin/posts">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>
          New Post
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        <CreatePostForm />
      </div>
    </div>
  );
};

export default CreatePostPage;
