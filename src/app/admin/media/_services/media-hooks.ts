import { ALLOWED_ADMIN_UPLOAD_TYPES } from '@/config/constants';
import { queryKeys } from '@/config/queryKeys';
import { Media } from '@prisma/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef, useState, MutableRefObject } from 'react';
import { toast } from 'sonner';

import { generateRandomKey } from '@/lib/crypto';
import { SortOrder } from '@/lib/schema'; // Asegúrate de que SortOrder sea 'asc' | 'desc'

import mediaActions from './media-actions';

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Actualizamos el tipo UploadFile
type UploadFile = {
  id: string;
  file: File;
  error?: string;
  isUploaded?: boolean;
  isCustomBackground?: boolean; // Nuevo campo
  isPremium?: boolean;          // Nuevo campo
};

export const useUploadFiles = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const controller: MutableRefObject<AbortController | null> = useRef(null);

  // Actualizamos addFiles para aceptar los nuevos parámetros
  const addFiles = (
    newFiles: File[],
    isCustomBackground: boolean = false, // Nuevo parámetro
    isPremium: boolean = false          // Nuevo parámetro
  ) => {
    const filteredFiles = newFiles.filter((file) => {
      const ext = file.name.split('.').pop();
      if (!ALLOWED_ADMIN_UPLOAD_TYPES.find((type) => file.type.startsWith(type) || type === ext)) {
        toast.error('File type not allowed .' + ext);
        return false;
      }
      return true;
    });
    const filesToAdd = filteredFiles.map((file) => ({
      id: generateRandomKey(16),
      file,
      isCustomBackground, // Asignar el nuevo campo
      isPremium,          // Asignar el nuevo campo
    }));
    setFiles((prev) => [...prev, ...filesToAdd]);
  };

  const uploadFile = async (item: UploadFile) => {
    const formData = new FormData();
    formData.append('file', item.file);
    // Añadir los nuevos campos al FormData
    formData.append('isCustomBackground', String(item.isCustomBackground));
    formData.append('isPremium', String(item.isPremium));

    setUploading(true);
    setProgress(0);
    controller.current = new AbortController();

    try {
      await axios.post(`${apiUrl}/api/media`, formData, {
        signal: controller.current?.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent?.total || 1),
          );
          setProgress(percentCompleted);
        },
      });

      setProgress(0);
      setFiles((prev) =>
        prev.map((file) => (file.id === item.id ? { ...file, isUploaded: true } : file)),
      );
      queryClient.invalidateQueries({ queryKey: [queryKeys.media] });
    } catch (err: any) {
      const error = err.response?.data?.message || 'An error occurred';
      setFiles((prev) => prev.map((file) => (file.id === item.id ? { ...file, error } : file)));
    } finally {
      setUploading(false);
    }
  };

  const cancelUpload = (id: string) => {
    if (uploadingId === id) {
      controller.current?.abort();
      setUploading(false);
      setProgress(0);
      setUploadingId(null);
    }
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  useEffect(() => {
    if (files.length > 0 && !isUploading) {
      const file = files.find((file) => !file.isUploaded && !file.error);
      if (file) {
        setUploadingId(file.id);
        uploadFile(file);
      }
    }
  }, [files.length, isUploading, files, uploadFile]);

  return {
    files,
    addFiles,
    cancelUpload,
    progress,
    isUploading,
    uploadingId,
  };
};

// Importa el tipo inferido de Zod para los filtros de consulta
import mediaSchema from '@/server/media/media-schema'; // <--- CORRECCIÓN AQUÍ: Importación por defecto
type MediaFilters = z.infer<typeof mediaSchema.mediaQuerySchema>; // <--- CORRECCIÓN AQUÍ: Acceder a través del objeto por defecto

export const useMediaTable = () => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [preview, setPreview] = useState<Media | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Inicializa filters con el tipo MediaFilters y sus valores por defecto
  const [filters, setFilters] = useState<MediaFilters>({
    page: 1,
    limit: 15,
    sort: 'createdAt',
    order: 'desc',
    search: '',
    // isCustomBackground y isPremium no necesitan inicializarse aquí si son opcionales en el esquema
    // y no se usan en el estado inicial de la tabla de administración.
  });
  const queryClient = useQueryClient();

  // Ajusta setFilter para que sea más flexible con Partial
  const setFilter = (filter: Partial<MediaFilters>) => {
    setFilters((prev) => {
      const newFilters = { ...prev, page: 1, ...filter };

      // Asegura que sort y order siempre sean string y SortOrder, respectivamente.
      // Si filter.sort/order es undefined, se usa el valor previo (que ya es válido).
      // Si filter.sort/order es un string/SortOrder, se usa ese valor.
      // Esto evita que el tipo se convierta en 'string | undefined' o 'SortOrder | undefined'.
      newFilters.sort = filter.sort !== undefined ? filter.sort : prev.sort;
      newFilters.order = filter.order !== undefined ? filter.order : prev.order;

      return newFilters;
    });
  };

  const deleteMedia = useMutation({
    mutationFn: mediaActions.deleteMedia,
    mutationKey: [queryKeys.media],
    onSuccess() {
      setSelected([]);
      setShowDeleteDialog(false);
      toast.success('Media deleted successfully');
      queryClient.invalidateQueries({ queryKey: [queryKeys.media] });
    },
    onError(error) {
      toast.error(error.message);
    },
  });

  const { data, isFetching } = useQuery({
    queryKey: [queryKeys.media, filters],
    queryFn: () =>
      mediaActions.queryMedia({
        // Pasa directamente los filtros. mediaActions.queryMedia se encargará de parsear con Zod.
        ...filters,
        // Si necesitas pasar isCustomBackground o isPremium para esta tabla específica,
        // agrégalos aquí. Por ejemplo, si esta tabla siempre debe mostrar solo fondos personalizados
        // isCustomBackground: true,
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
    preview,
    setPreview,
    showDeleteDialog,
    setShowDeleteDialog,
    deleteMedia,
    openUploadDialog,
    setOpenUploadDialog,
    openPreviewDialog,
    setOpenPreviewDialog,
  };
};