import { ALLOWED_IMAGE_TYPES } from '@/config/constants';
import { queryKeys } from '@/config/queryKeys';
import { RemoveBgResponse } from '@/server/ai/ai-services';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

import removebgActions from './removebg-actions';

const apiUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const useRemoveBg = () => {
  const queryClient = useQueryClient();
  const [image, setImage] = React.useState<{
    image: File;
    preview: string;
    result?: RemoveBgResponse;
    hdUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showOrignal, setShowOrignal] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null); // Nuevo estado para errores

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];

    // Check if the file is an image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a valid image file.');
      return;
    }

    const preview = URL.createObjectURL(file);

    // Resetear el resultado y HD URL al cargar una nueva imagen
    setImage({
      image: file,
      preview,
      result: undefined, // Asegurarse de que el resultado anterior se borre
      hdUrl: undefined,
    });
    setError(null); // Limpiar cualquier error anterior

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files?.length) return;

    const file = files[0];

    // Check if the file is an image
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Please upload a valid image file.');
      return;
    }

    const preview = URL.createObjectURL(file);

    // Resetear el resultado y HD URL al cargar una nueva imagen
    setImage({
      image: file,
      preview,
      result: undefined, // Asegurarse de que el resultado anterior se borre
      hdUrl: undefined,
    });
    setError(null); // Limpiar cualquier error anterior
  };

  const onClear = () => {
    setImage(null);
    setIsLoading(false);
    setShowOrignal(false);
    setProgress(0);
    setError(null); // Limpiar errores al limpiar
  };

  const removeBg = async () => {
    if (!image || isLoading) return; // Evitar llamadas duplicadas si ya está cargando

    setIsLoading(true);
    setShowOrignal(false);
    setProgress(0); // Reiniciar el progreso
    setError(null); // Limpiar errores antes de un nuevo intento

    const formData = new FormData();
    formData.append('image', image.image); // Usar image.image directamente

    try {
      const response = await axios.post(`${apiUrl}/api/ai/remove-image-bg`, formData, {
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const current = progressEvent.loaded || 0;
          const percentCompleted = Math.round((current / total) * 100);
          setProgress(percentCompleted);
        },
      });
      const { data } = response;
      // Asegurarse de que 'data' tenga la estructura esperada de RemoveBgResponse
      if (data && data.preview && data.id) {
        setImage((prev) => ({
          ...prev!,
          result: data, // Asignar la respuesta completa a 'result'
        }));
      } else {
        throw new Error('Invalid response structure from background removal API.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred during background removal.';
      toast.error(errorMessage);
      setError(errorMessage); // Guardar el error en el estado
      onClear(); // Limpiar el estado en caso de error para permitir un nuevo intento
    } finally {
      setIsLoading(false);
    }
  };

  const premiumDownloadMutation = useMutation({
    mutationFn: removebgActions.unlockPremium,
    onSuccess: async ({ url }) => {
      setImage((prev) => ({
        ...prev!,
        hdUrl: url,
      }));
      queryClient.invalidateQueries({ queryKey: [queryKeys.credits] });
      window.open(url, '_blank');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const downloadPremium = async () => {
    if (!image?.result?.id) {
      toast.error('No image result available for premium download.');
      return;
    }

    if (image?.hdUrl) {
      window.open(image.hdUrl, '_blank');
      return;
    }

    premiumDownloadMutation.mutate(image.result.id);
  };

  // Este useEffect disparará removeBg cuando se establezca una nueva imagen
  useEffect(() => {
    if (image?.image && !image.result && !isLoading) { // Solo si hay una imagen, no hay resultado y no está cargando
      removeBg();
    }
  }, [image?.image, image?.result, isLoading]); // Dependencias actualizadas

  // Opcional: Un useEffect para reintentar o mostrar un mensaje si el resultado no llega
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (image && image.image && !image.result && !isLoading && !error) {
      // Si hay una imagen, no hay resultado, no está cargando y no hay error,
      // esperamos un poco y si sigue sin resultado, mostramos un mensaje o reintentamos.
      timer = setTimeout(() => {
        if (image && image.image && !image.result && !isLoading && !error) {
          toast.warning('Still processing or waiting for result. Please wait or try re-uploading.');
          // Opcional: podrías llamar a removeBg() de nuevo aquí para un reintento automático
          // removeBg();
        }
      }, 10000); // Esperar 10 segundos
    }
    return () => clearTimeout(timer);
  }, [image, isLoading, error]);


  return {
    progress,
    image,
    setImage,
    onChange,
    onDrop,
    onClear,
    isLoading,
    showOrignal,
    setShowOrignal,
    inputRef,
    downloadPremium,
    premiumDownloadMutation,
    error, // Exponer el estado de error
  };
};
