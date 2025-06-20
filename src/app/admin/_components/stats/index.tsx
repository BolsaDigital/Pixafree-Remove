'use client';

import { IconUsers, IconClockDollar, IconSparkles, IconVip } from '@tabler/icons-react';
import React from 'react';

import { useAdminStats } from '../../_services/dashboard-hooks';
import StatBox from './stat-box';

const AdminStats = () => {
  const { stats, isLoading } = useAdminStats();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatBox
        name="Today Images Processed"
        icon={<IconSparkles />}
        value={stats?.todayImagesProcessed || 0}
        isLoading={isLoading}
      />
      <StatBox
        name="Today Credits Used"
        icon={<IconVip />}
        value={stats?.todayCreditsUsed || 0}
        isLoading={isLoading}
      />
      <StatBox
        name="Active Subscriptions"
        icon={<IconClockDollar />}
        value={stats?.activeSubscriptions || 0}
        isLoading={isLoading}
      />
      <StatBox
        name="Users"
        icon={<IconUsers />}
        value={stats?.usersCount || 0}
        isLoading={isLoading}
      />
    </div>
  );
};

export default AdminStats;
