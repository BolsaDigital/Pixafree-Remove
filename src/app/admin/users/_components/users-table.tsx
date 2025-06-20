'use client';

import { UserRole } from '@prisma/client';
import { Trash2 } from 'lucide-react';
import React from 'react';
import Moment from 'react-moment';

import DataTable from '@/components/datatable';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';

import { toCapitalize } from '@/lib/utils';

import { useUsersTable } from '../_services/user-hooks';
import CreateUserDialog from './create-user';
import UpdateUserDialog from './update-user';

const UsersTable = () => {
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteUsers,
    showCreateUser,
    setShowCreateUser,
    editId,
    setEditId,
  } = useUsersTable();

  return (
    <>
      <DataTable
        title="Users"
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add user"
        onAddClick={() => setShowCreateUser(true)}
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
        onClickRow={(row) => setEditId(row.id)}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 250,
          },
          {
            title: 'Email',
            key: 'email',
            sortable: true,
            maxWidth: 250,
          },
          {
            title: 'Role',
            key: 'role',
            sortable: true,
            render: (value) => (
              <Badge variant={value === 'admin' ? 'success' : 'default'} className="capitalize">
                {value}
              </Badge>
            ),
          },
          {
            title: 'Verified',
            key: 'emailVerified',
            render: (value) => (
              <Badge variant={value ? 'success' : 'destructive'}>
                {value ? 'Verified' : 'Not verified'}
              </Badge>
            ),
            sortable: true,
          },
          {
            title: 'Created At',
            key: 'createdAt',
            render: (value) => (
              <Moment format="DD/MM/YYYY" className="text-[13px]">
                {value}
              </Moment>
            ),
            sortable: true,
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
        filters={[
          {
            type: 'multi-select',
            key: 'role',
            label: 'Role',
            value: filters.role,
            options: Object.keys(UserRole).map((role) => ({
              label: toCapitalize(role),
              value: role,
            })),
            onFilter(value) {
              setFilter({ role: value });
            },
          },
          {
            type: 'multi-select',
            key: 'emailVerified',
            label: 'Email Verified',
            value: filters.emailVerified,
            options: [
              { label: 'Verified', value: 'true' },
              { label: 'Not verified', value: 'false' },
            ],
            onFilter(value) {
              setFilter({ emailVerified: value });
            },
          },
        ]}
      />
      <DeleteAlert
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => deleteUsers.mutate(selected)}
        isLoading={deleteUsers.isPending}
      />
      <CreateUserDialog isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} />
      <UpdateUserDialog
        isOpen={editId !== null}
        onClose={() => setEditId(null)}
        id={editId as string}
      />
    </>
  );
};

export default UsersTable;
