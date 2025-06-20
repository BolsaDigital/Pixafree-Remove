'use client';

import { Trash2 } from 'lucide-react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'nextjs-toploader/app';
import React from 'react';
import Moment from 'react-moment';

import DataTable from '@/components/datatable';
import { Badge } from '@/components/ui/badge';
import DeleteAlert from '@/components/ui/delete-alert';

import { usePostsTable } from '../_services/post-hooks';

const PostsTable = () => {
  const router = useRouter();
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    showDeleteDialog,
    setShowDeleteDialog,
    deletePosts,
  } = usePostsTable();

  return (
    <>
      <DataTable
        title="Posts"
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add post"
        onAddClick={() => router.push('/admin/posts/new')}
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
        onClickRow={(row) => router.push(`/admin/posts/${row.id}`)}
        columns={[
          {
            title: 'Title',
            key: 'title',
            sortable: true,
            maxWidth: 250,
            render: (value, row) => {
              return (
                <div className="flex items-center">
                  <Image
                    src={row?.thumbnail || '/images/placeholder.svg'}
                    width={50}
                    height={50}
                    className="size-10 min-w-10 rounded-md object-cover mr-3"
                    alt="Preview"
                  />
                  <div className="text-sm font-medium">{value}</div>
                </div>
              );
            },
          },
          {
            title: 'Tags',
            key: 'tags',
            maxWidth: 250,
            render: (value) => {
              return (
                <div className="flex flex-wrap gap-2">
                  {value.slice(0, 1).map((tag: any) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              );
            },
          },
          {
            title: 'Status',
            key: 'status',
            width: 120,
            sortable: true,
            render: (_, row) => {
              const isPublished = moment().isAfter(row.publishedAt);

              return (
                <Badge variant={isPublished ? 'success' : 'secondary'}>
                  {isPublished ? 'Published' : 'Scheduled'}
                </Badge>
              );
            },
          },
          {
            title: 'Published At',
            key: 'publishedAt',
            width: 150,
            render: (value) => (
              <Moment format="DD/MM/YYYY" className="text-[13px]">
                {value}
              </Moment>
            ),
            sortable: true,
          },
          {
            title: 'Updated At',
            key: 'updatedAt',
            width: 150,
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
      />
      <DeleteAlert
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={() => deletePosts.mutate(selected)}
        isLoading={deletePosts.isPending}
      />
    </>
  );
};

export default PostsTable;
