'use client';

import { Loader } from 'lucide-react';
import React from 'react';

import { MinimalTiptapEditor } from '@/components/rich-editor';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TagsInput } from '@/components/ui/tags-input';
import { Textarea } from '@/components/ui/textarea';

import { toSlug } from '@/lib/utils';

import { useUpdatePost } from '../_services/post-hooks';
import ImagePicker from '../../media/components/image-picker';
import PostLoader from './post-loader';

const UpdatePostForm = () => {
  const { form, onSubmit, isLoading, isPending } = useUpdatePost();

  return (
    <>
      {isLoading ? (
        <PostLoader />
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="relative grid gap-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Post title..."
                      value={field.value}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        form.setValue('slug', toSlug(e.target.value));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Post slug"
                      value={field.value}
                      onChange={(e) => field.onChange(toSlug(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Post exerpt" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-4 justify-between items-center">
                    <div className="space-y-1">
                      <FormLabel>Thumbnail</FormLabel>
                      <p className="text-muted-foreground text-xs max-w-[300px]">
                        Thumbnail image for the post. Recommended size: 1200x600
                      </p>
                    </div>
                    <FormControl>
                      <ImagePicker value={field.value} onChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsInput value={field.value} onChange={(tags) => field.onChange(tags)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="publishedAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Published At</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={(date) => field.onChange(date)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <div className="group flex flex-col">
                      <MinimalTiptapEditor
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-2 flex justify-end gap-3">
              <Button disabled={isPending} className="min-w-[120px] h-10" type="submit">
                {isPending ? <Loader className="animate-spin" /> : 'Update Post'}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
};

export default UpdatePostForm;
