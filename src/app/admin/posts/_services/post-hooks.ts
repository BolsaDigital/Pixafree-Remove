import { queryKeys } from '@/config/queryKeys';
import postSchema from '@/server/posts/post-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SortOrder } from '@/lib/schema';

import postActions from './post-actions';

export const usePostsTable = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 15,
    sort: undefined as string | undefined,
    order: undefined as SortOrder,
    search: '',
  });
  const queryClient = useQueryClient();

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const deletePosts = useMutation({
    mutationFn: postActions.deletePosts,
    mutationKey: [queryKeys.posts],
    onSuccess() {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Posts deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: [queryKeys.posts, filters],
    queryFn: () =>
      postActions.queryPosts({
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order,
        ...(filters.search && { search: filters.search }),
      }),
  });

  useEffect(() => {
    setSelected([]);
  }, [filters]);

  return {
    filters,
    setFilter,
    data,
    isFetching,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    deletePosts,
  };
};

export function useCreatePost() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof postSchema.createPostSchema>>({
    resolver: zodResolver(postSchema.createPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      thumbnail: '',
      publishedAt: new Date(),
      tags: [],
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (data: z.infer<typeof postSchema.createPostSchema>) => postActions.createPost(data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    createPostMutation.mutate(data, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
        toast.success('Post created successfully');
        router.push(`/admin/posts/${data.id}`);
      },
      onError: (error) => {
        toast.error(error?.message ?? 'An error occurred');
      },
    });
  });

  return {
    form,
    onSubmit,
    isLoading: createPostMutation.isPending,
  };
}

export function useUpdatePost() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof postSchema.createPostSchema>>({
    resolver: zodResolver(postSchema.createPostSchema),
    defaultValues: {
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      thumbnail: '',
      publishedAt: new Date(),
      tags: [],
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [id],
    queryFn: () => postActions.getPost(id),
  });

  const updatePostMutation = useMutation({
    mutationFn: (data: z.infer<typeof postSchema.createPostSchema>) =>
      postActions.updatePost(id, data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    updatePostMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.posts] });
        toast.success('Post updated successfully');
      },
      onError: (error) => {
        toast.error(error?.message ?? 'An error occurred');
      },
    });
  });

  useEffect(() => {
    if (data && !isLoading) {
      form.reset({
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt ?? '',
        thumbnail: data.thumbnail ?? '',
        publishedAt: new Date(data.publishedAt),
        tags: data?.tags?.map((e) => e.name) ?? [],
      });
    }
  }, [data, isLoading]);

  return {
    form,
    onSubmit,
    isPending: updatePostMutation.isPending,
    isLoading,
  };
}
