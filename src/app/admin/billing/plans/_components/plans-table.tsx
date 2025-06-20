'use client';

import { useSettings } from '@/app/_providers/settings-provider';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';

import DataTable from '@/components/datatable';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';

import { formatAmount } from '@/lib/utils';

import { usePlansTable } from '../_services/plan-hooks';

const PlansTable = () => {
  const settings = useSettings();
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    deletePlans,
  } = usePlansTable();
  const router = useRouter();

  return (
    <>
      <DataTable
        title="Plans"
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add plan"
        onAddClick={() => router.push('/admin/billing/plans/add')}
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
        selection={{
          selected,
          setSelected,
        }}
        onClickRow={(row) => {
          router.push(`/admin/billing/plans/${row.id}`);
        }}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 250,
          },
          {
            title: 'Price',
            key: 'monthlyPrice',
            sortable: true,
            render: (_, row) => {
              return (
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {formatAmount(row.monthlyPrice, settings.billing.currency)} / month
                  </Badge>
                  <Badge variant="secondary">
                    {formatAmount(row.yearlyPrice, settings.billing.currency)} / year
                  </Badge>
                </div>
              );
            },
          },
          {
            title: 'Credits',
            key: 'credits',
            sortable: true,
            render: (_, row) => {
              return (
                <Badge variant="secondary" className="capitalize">
                  {row.credits} credits
                </Badge>
              );
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
        ]}
        actions={[
          {
            label: <Trash2 />,
            className: '!text-destructive',
            onClick: () => {
              if (selected.length > 0) {
                setShowDeleteDialog(true);
              }
            },
          },
        ]}
      />
      <DeleteAlert
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => deletePlans.mutate(selected)}
        isLoading={deletePlans.isPending}
      />
    </>
  );
};

export default PlansTable;
