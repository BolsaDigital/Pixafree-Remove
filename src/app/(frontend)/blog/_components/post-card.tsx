import { Post } from '@/server/posts/post-services';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

const PostCard = ({ post }: { post: Post }) => {
  return (
    <Card key={post.id} className="flex flex-col gap-0 pb-6 shadow-none">
      <div className="w-full">
        <Link
          href={`/blog/${post.slug}`}
          className="transition-opacity duration-200 fade-in hover:opacity-70"
        >
          <Image
            width={500}
            height={400}
            src={post.thumbnail || '/images/placeholder.svg'}
            alt={post.title}
            className="h-full w-full aspect-[14/9] object-cover object-center rounded-tl-[13px] rounded-tr-[13px]"
          />
        </Link>
      </div>
      <CardHeader className="mt-6">
        <h3 className="text-lg font-semibold hover:underline md:text-xl">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>
      </CardHeader>
      {post.excerpt && (
        <CardContent className="mt-4">
          <p className="text-muted-foreground">{post.excerpt}</p>
        </CardContent>
      )}

      <CardFooter className="mt-6">
        <Button asChild variant="link" className="!px-0">
          <Link href={`/blog/${post.slug}`}>
            Read more
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
