import { queryKeys } from '@/config/queryKeys';
import { useQuery } from '@tanstack/react-query';

import dashboardActions from './dashboard-actions';

export function useAdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [queryKeys.admin.stats],
    queryFn: dashboardActions.adminStats,
  });

  return {
    stats,
    isLoading,
  };
}
