import settingServices from '@/server/settings/setting-services';
import { ArrowLeftIcon } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';
import React, { cache } from 'react';

import { Button } from '@/components/ui/button';

import EditPostForm from '../_components/edit-post';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await cache(settingServices.publicSettings)();

  return {
    title: `Edit Post - ${settings?.general.applicationName || ''}`,
  };
}

const EditPostPage = () => {
  return (
    <div>
      <div className="space-y-1 pb-7 mb-7">
        <h1 className="text-2xl font-bold tracking-tight">
          <Button variant="outline" className="mr-4 size-8" asChild size="icon">
            <Link href="/admin/posts">
              <ArrowLeftIcon className="w-6 h-6" />
            </Link>
          </Button>
          Edit Post
        </h1>
      </div>
      <div className="max-w-3xl mx-auto">
        <EditPostForm />
      </div>
    </div>
  );
};

export default EditPostPage;
