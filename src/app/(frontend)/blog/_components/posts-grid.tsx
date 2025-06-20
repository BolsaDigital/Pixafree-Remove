import { PublicPostsResponse } from '@/server/posts/post-services';
import React from 'react';

import PostCard from './post-card';

const PostsGrid = ({ postsData }: { postsData: PublicPostsResponse }) => {
  return (
    <>
      {postsData?.docs?.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {postsData?.docs?.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-lg text-accent-foreground font-medium">No posts available.</p>
        </div>
      )}
    </>
  );
};

export default PostsGrid;
