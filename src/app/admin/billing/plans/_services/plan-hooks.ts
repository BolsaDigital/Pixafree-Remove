import { useSettings } from '@/app/_providers/settings-provider';
import { queryKeys } from '@/config/queryKeys';
import planSchema from '@/server/plans/plan-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { SortOrder } from '@/lib/schema';

import planActions from './plan-actions';

export const usePlansTable = () => {
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

  const deletePlans = useMutation({
    mutationFn: planActions.deletePlans,
    mutationKey: [queryKeys.billing.plans],
    onSuccess() {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Plans deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.billing.plans] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: [queryKeys.billing.plans, filters],
    queryFn: () =>
      planActions.queryPlans({
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
    deletePlans,
  };
};

export function useCreatePlan() {
  const router = useRouter();
  const settings = useSettings();
  const createPlanSchema = planSchema.createPlanSchema.superRefine((data, ctx) => {
    if (settings.billing.billingProvider === 'stripe') {
      if (!data.productId) {
        ctx.addIssue({
          code: 'custom',
          path: ['productId'],
          message: 'Product id is required',
        });
      }
      if (!data.monthlyPriceId) {
        ctx.addIssue({
          code: 'custom',
          path: ['monthlyPriceId'],
          message: 'Price id is required',
        });
      }
      if (!data.yearlyPriceId) {
        ctx.addIssue({
          code: 'custom',
          path: ['yearlyPriceId'],
          message: 'Price id is required',
        });
      }
    }
  });
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof createPlanSchema>>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      monthlyPrice: undefined,
      monthlyPriceId: '',
      yearlyPrice: undefined,
      yearlyPriceId: '',
      productId: '',
      features: '',
      status: 'active',
      position: undefined,
      credits: undefined,
      isPopular: false,
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof createPlanSchema>) => planActions.createPlan(data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    createPlanMutation.mutate(data, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.billing.plans] });
        toast.success('Plan created successfully');
        router.push(`/admin/billing/plans/${data.id}`);
      },
      onError: (error) => {
        toast.error(error?.message ?? 'An error occurred');
      },
    });
  });

  return {
    form,
    onSubmit,
    isPending: createPlanMutation.isPending,
    settings,
  };
}

export function useUpdatePlan(id: string) {
  const settings = useSettings();
  const createPlanSchema = planSchema.createPlanSchema.superRefine((data, ctx) => {
    if (settings.billing.billingProvider === 'stripe') {
      if (!data.productId) {
        ctx.addIssue({
          code: 'custom',
          path: ['productId'],
          message: 'Product id is required',
        });
      }
      if (!data.monthlyPriceId) {
        ctx.addIssue({
          code: 'custom',
          path: ['monthlyPriceId'],
          message: 'Price id is required',
        });
      }
      if (!data.yearlyPriceId) {
        ctx.addIssue({
          code: 'custom',
          path: ['yearlyPriceId'],
          message: 'Price id is required',
        });
      }
    }
  });
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof createPlanSchema>>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      monthlyPrice: undefined,
      monthlyPriceId: '',
      yearlyPrice: undefined,
      yearlyPriceId: '',
      productId: '',
      features: '',
      status: 'active',
      position: undefined,
      credits: undefined,
      isPopular: false,
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [queryKeys.billing.plans, id],
    queryFn: () => planActions.getPlan(id),
  });

  const updatePlanMutation = useMutation({
    mutationFn: (data: z.infer<typeof createPlanSchema>) => planActions.updatePlan(id, data),
  });

  const onSubmit = form.handleSubmit(async (data) => {
    updatePlanMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.billing.plans] });
        toast.success('Plan updated successfully');
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
        description: data.description || '',
        monthlyPrice: data.monthlyPrice || 0,
        monthlyPriceId: data.monthlyPriceId || '',
        yearlyPrice: data.yearlyPrice || 0,
        yearlyPriceId: data.yearlyPriceId || '',
        productId: data.productId || '',
        features: data.features,
        status: data.status,
        position: data.position,
        credits: data.credits,
        isPopular: data.isPopular || false,
      });
    }
  }, [data, isLoading]);

  return {
    form,
    onSubmit,
    isPending: updatePlanMutation.isPending,
    isLoading,
    settings,
  };
}
