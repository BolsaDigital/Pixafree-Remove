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

// Define una interfaz para el tipo de datos 'Media' que incluye los nuevos campos
// Esto es importante para el tipado correcto, aunque en runtime ya existen.
interface MediaRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: string;
  updatedAt: string;
  isCustomBackground?: boolean; // Añadido
  isPremium?: boolean; // Añadido
}

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
        onClickRow={(record: MediaRecord) => { // Usar MediaRecord aquí
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
            render(value: string, record: MediaRecord) { // Usar MediaRecord aquí
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
            render: (value: number) => <>{formatFileSize(value)}</>,
            sortable: true,
          },
          // NUEVA COLUMNA: Estado Editor
          {
            title: 'Estado Editor',
            key: 'editorStatus',
            render: (value: any, record: MediaRecord) => { // Usar MediaRecord aquí
              if (record.isCustomBackground) {
                return (
                  <div className="flex flex-col items-start space-y-1">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                      Fondo Personalizado
                    </span>
                    {record.isPremium ? (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Gratis
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  No es Fondo
                </span>
              );
            },
            sortable: false, // No se puede ordenar por este campo directamente
          },
          {
            title: 'Created At',
            key: 'createdAt',
            render: (value: string) => (
              <Moment format="DD/MM/YYYY" className="text-[13px]">
                {value}
              </Moment>
            ),
            sortable: true,
          },
          {
            title: 'Updated At',
            key: 'updatedAt',
            render: (value: string) => (
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
