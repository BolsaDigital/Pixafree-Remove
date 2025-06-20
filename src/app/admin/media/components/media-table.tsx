'use client';

import { FileIcon, Trash2, VideoIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import Moment from 'react-moment';
import { toast } from 'sonner';

import DataTable from '@/components/datatable';
import DeleteAlert from '@/components/ui/delete-alert';

import { formatFileSize } from '@/lib/utils';

import { useMediaTable } from '../_services/media-hooks';
import PreviewMediaDialog from './preview-media';
import UploadDialog from './upload-dialog';

const MediaTable = ({
  onSelect,
  allowTypes,
}: {
  onSelect?: (url?: string) => void;
  allowTypes?: string[];
}) => {
  const {
    setFilter,
    data,
    isFetching,
    filters,
    selected,
    setSelected,
    setPreview,
    preview,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteMedia,
    openUploadDialog,
    setOpenUploadDialog,
    openPreviewDialog,
    setOpenPreviewDialog,
  } = useMediaTable();

  return (
    <>
      <DataTable
        title="Media"
        onSearch={(e) => setFilter({ search: e })}
        addButtonText="Add media"
        onAddClick={() => setOpenUploadDialog(true)}
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
        selection={
          !onSelect
            ? {
                selected,
                setSelected,
              }
            : undefined
        }
        onClickRow={(record) => {
          if (onSelect) {
            if (allowTypes && !allowTypes.find((type) => record.mimeType.startsWith(type))) {
              toast.error(`Only ${allowTypes.join(', ')} files are allowed.`);
            } else {
              onSelect(record.url);
            }
          } else {
            setPreview(record);
            setOpenPreviewDialog(true);
          }
        }}
        columns={[
          {
            title: 'Name',
            key: 'name',
            sortable: true,
            maxWidth: 250,
            render(value, record) {
              return (
                <div className="flex items-center">
                  {record.mimeType.startsWith('image') ? (
                    <Image
                      src={record?.url}
                      width={50}
                      height={50}
                      className="size-10 min-w-10 rounded-md object-cover mr-3"
                      alt="Preview"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreview(record);
                        setOpenPreviewDialog(true);
                      }}
                    />
                  ) : (
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreview(record);
                        setOpenPreviewDialog(true);
                      }}
                      className="size-10 min-w-10 mr-3 flex items-center justify-center bg-gray-200 text-gray-500 rounded-md"
                    >
                      <span className="text-xl">
                        {record.mimeType.startsWith('video') ? (
                          <VideoIcon className="size-4" />
                        ) : (
                          <FileIcon className="size-4" />
                        )}
                      </span>
                    </div>
                  )}
                  <p className="truncate">{value}</p>
                </div>
              );
            },
          },
          {
            title: 'Type',
            key: 'mimeType',
            sortable: true,
          },
          {
            title: 'Size',
            key: 'size',
            render: (value) => <>{formatFileSize(value)}</>,
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
          {
            title: 'Updated At',
            key: 'updatedAt',
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
        onDelete={() => deleteMedia.mutate(selected)}
        isLoading={deleteMedia.isPending}
      />
      <UploadDialog openUploadDialog={openUploadDialog} setOpenUploadDialog={setOpenUploadDialog} />
      <PreviewMediaDialog
        media={preview}
        open={openPreviewDialog}
        onCLose={() => setOpenPreviewDialog(false)}
      />
    </>
  );
};

export default MediaTable;
