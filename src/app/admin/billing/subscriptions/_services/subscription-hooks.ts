import { queryKeys } from '@/config/queryKeys';
import { SubscriptionStatus } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { SortOrder } from '@/lib/schema';

import subscriptionActions from './subscription-actions';

export const useSubscriptionsTable = (limit?: number) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: limit || 15,
    sort: undefined as string | undefined,
    order: undefined as SortOrder,
    status: [] as SubscriptionStatus[],
  });

  const setFilter = (filter: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, page: 1, ...filter }));
  };

  const { data, isFetching } = useQuery({
    queryKey: [queryKeys.billing.subscriptions, filters],
    queryFn: () =>
      subscriptionActions.querySubscriptions({
        page: filters.page,
        limit: filters.limit,
        sort: filters.sort,
        order: filters.order,
        ...(filters.status.length && { status: filters.status.join(',') }),
      }),
  });

  return {
    filters,
    setFilter,
    data,
    isFetching,
  };
};
