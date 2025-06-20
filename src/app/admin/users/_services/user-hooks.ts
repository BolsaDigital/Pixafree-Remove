import { queryKeys } from '@/config/queryKeys';
import userSchema from '@/server/users/user-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SortOrder } from '@/lib/schema';

import userActions from './user-actions';

export const useUsersTable = (limit?: number) => {
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [filters, setFilters] = useState({
    page: 1,
    limit: limit || 15,
    role: [] as string[],
    emailVerified: [] as string[],
    sort: undefined as string | undefined,
    order: undefined as SortOrder,
    search: '',
  });
  const queryClient = useQueryClient();

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const deleteUsers = useMutation({
    mutationFn: userActions.deleteUsers,
    mutationKey: [queryKeys.users],
    onSuccess() {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Users deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: [queryKeys.users, filters],
    queryFn: () =>
      userActions.queryUsers({
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order,
        ...(filters.search && { search: filters.search }),
        ...(filters.role.length && { role: filters.role.join(',') }),
        ...(filters.emailVerified.length && { emailVerified: filters.emailVerified.join(',') }),
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
    deleteUsers,
    showCreateUser,
    setShowCreateUser,
    editId,
    setEditId,
  };
};

export function useCreateUser(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof userSchema.createUserSchema>>({
    resolver: zodResolver(userSchema.createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      emailVerified: false,
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof userSchema.createUserSchema>) => userActions.createUser(data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    createUserMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
        toast.success('User created successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error?.message ?? 'An error occurred');
      },
    });
  });

  return {
    form,
    onSubmit,
    isLoading: createUserMutation.isPending,
  };
}

export function useUpdateUser(id: string, onSuccess: () => void) {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof userSchema.updateUserSchema>>({
    resolver: zodResolver(userSchema.updateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      emailVerified: false,
      role: 'user',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.users, id],
    queryFn: () => userActions.getUser(id),
  });

  const updateUserMutation = useMutation({
    mutationFn: (data: z.infer<typeof userSchema.updateUserSchema>) =>
      userActions.updateUser(id, data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    updateUserMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.users] });
        toast.success('User updated successfully');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error?.message ?? 'An error occurred');
      },
    });
  });

  useEffect(() => {
    if (data && !isLoading) {
      form.reset({
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        role: data.role,
      });
    }
  }, [data, isLoading]);

  return {
    form,
    onSubmit,
    isPending: updateUserMutation.isPending,
    isLoading,
  };
}
