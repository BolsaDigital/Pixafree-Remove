'use client';

import { SubscriptionStatus } from '@prisma/client';
import React from 'react';
import Moment from 'react-moment';

import DataTable from '@/components/datatable';
import { Badge } from '@/components/ui/badge';

import { toCapitalize } from '@/lib/utils';

import { useSubscriptionsTable } from '../_services/subscription-hooks';

const SubscriptionsTable = () => {
  const { setFilter, data, isFetching, filters } = useSubscriptionsTable();

  return (
    <>
      <DataTable
        title="Subscriptions"
        pagination={{
          page: filters.page,
          limit: filters.limit,
          totalPages: data?.pagination.totalPages || 1,
          setPage: (page) => setFilter({ page }),
          setLimit: (limit) => setFilter({ limit }),
        }}
        sort={{
          key: filters.sort,
          order: filters.order,
          onSort: (key, order) => setFilter({ sort: key, order }),
        }}
        isLoading={isFetching}
        data={data?.docs || []}
        columns={[
          {
            title: 'User',
            key: 'user',
            maxWidth: 250,
            render: (_, row) => {
              return (
                <div>
                  <div className="text-sm font-semibold">{row.user.name}</div>
                  <div className="text-xs text-muted-foreground">{row.user.email}</div>
                </div>
              );
            },
          },
          {
            title: 'Plan',
            key: 'plan',
            sortable: true,
            render: (_, row) => {
              return <Badge variant="secondary">{row.plan.name}</Badge>;
            },
          },
          {
            title: 'Status',
            key: 'status',
            sortable: true,
            render: (status) => {
              return (
                <Badge
                  className="capitalize"
                  variant={status === 'active' ? 'success' : 'secondary'}
                >
                  {status}
                </Badge>
              );
            },
          },
          {
            title: 'Current Billing Cycle',
            key: 'currentPeriodStart',
            sortable: true,
            render: (_, row) => {
              return (
                <div className="text-sm">
                  <Moment format="DD/MM/YYYY" className="text-[13px]">
                    {row.currentPeriodStart}
                  </Moment>{' '}
                  -{' '}
                  <Moment format="DD/MM/YYYY" className="text-[13px]">
                    {row.currentPeriodEnd}
                  </Moment>
                </div>
              );
            },
          },
          {
            title: 'Created At',
            key: 'createdAt',
            sortable: true,
            render: (value) => {
              return (
                <Moment format="DD/MM/YYYY" className="text-[13px]">
                  {value}
                </Moment>
              );
            },
          },
        ]}
        filters={[
          {
            type: 'multi-select',
            key: 'status',
            label: 'Status',
            value: filters.status,
            options: Object.keys(SubscriptionStatus).map((role) => ({
              label: toCapitalize(role),
              value: role,
            })),
            onFilter: (value) => {
              setFilter({ status: value as SubscriptionStatus[] });
            },
          },
        ]}
      />
    </>
  );
};

export default SubscriptionsTable;
