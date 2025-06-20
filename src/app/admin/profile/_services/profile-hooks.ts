import { useSettings } from '@/app/_providers/settings-provider';
import authActions from '@/app/(auth)/_services/auth-actions';
import { queryKeys } from '@/config/queryKeys';
import { UserResponse } from '@/server/auth/auth-services';
import userSchema from '@/server/users/user-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import profileActions from './profile-actions';

export const useProfile = (initialUser?: UserResponse) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    initialData: initialUser,
    queryFn: profileActions.getProfile,
    queryKey: [queryKeys.profile],
    enabled: !initialUser,
  });

  const form = useForm<z.infer<typeof userSchema.updateProfileSchema>>({
    resolver: zodResolver(userSchema.updateProfileSchema),
    defaultValues: {
      name: '',
    },
  });

  const updateProfifleMutation = useMutation({
    mutationFn: profileActions.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.profile],
      });
      toast.success('Profile updated successfully');
      form.resetField('avatar');
    },
    onError: (error) => {
      toast.error(error?.message || 'Something went wrong');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authActions.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.profile],
      });
      toast.success('Logged out successfully');
      queryClient.clear();
      queryClient.removeQueries({
        queryKey: [queryKeys.profile],
      });
      window.location.href = '/';
    },
    onError: (error) => {
      toast.error(error?.message || 'Something went wrong');
    },
  });

  const logout = async () => {
    logoutMutation.mutate();
  };

  const onSubmit = async (data: z.infer<typeof userSchema.updateProfileSchema>) => {
    updateProfifleMutation.mutate(data);
  };

  useEffect(() => {
    if (user || initialUser) {
      form.reset({
        name: initialUser?.name || user?.name,
      });
    }
  }, [user, initialUser]);

  return {
    user: initialUser || user,
    isLoading,
    form,
    onSubmit,
    isPending: updateProfifleMutation.isPending,
    logout,
    logoutLoading: logoutMutation.isPending,
  };
};

export const useUserSubscription = () => {
  const settings = useSettings();
  const { data: subscription, isLoading } = useQuery({
    queryFn: profileActions.getUserSubscription,
    queryKey: [queryKeys.subscription],
  });

  const customerPortalMutation = useMutation({
    mutationFn: () => {
      switch (settings.billing.billingProvider) {
        case 'stripe':
          return profileActions.getStripeCustomerPortal();
        default:
          throw new Error('Payment provider not configured.');
      }
    },
    onSuccess: ({ url }) => {
      window.open(url, '_blank');
    },
    onError: (error) => {
      toast.error(error?.message || 'Something went wrong');
    },
  });

  const openCustomerPortal = async () => {
    customerPortalMutation.mutate();
  };

  return {
    subscription,
    isLoading,
    openCustomerPortal,
    portalLoading: customerPortalMutation.isPending,
  };
};

export const useUpdatePassword = () => {
  const form = useForm<z.infer<typeof userSchema.updatePasswordSchema>>({
    resolver: zodResolver(userSchema.updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: profileActions.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
      form.reset();
    },
    onError: (error) => {
      toast.error(error?.message || 'Something went wrong');
    },
  });

  const onSubmit = async (data: z.infer<typeof userSchema.updatePasswordSchema>) => {
    updatePasswordMutation.mutate(data);
  };

  return { form, onSubmit, isPending: updatePasswordMutation.isPending };
};

export const useCredits = () => {
  const { data, isLoading } = useQuery({
    queryFn: profileActions.getCreditsInfo,
    queryKey: [queryKeys.credits],
  });

  return { credits: data?.credits, isLoading };
};
