import { ALLOWED_IMAGE_TYPES } from '@/config/constants';
import { queryKeys } from '@/config/queryKeys';
import { RemoveBgResponse } from '@/server/ai/ai-sevices';
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

    setImage({
      image: file,
      preview,
    });

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

    setImage({
      image: file,
      preview,
    });
  };

  const onClear = () => {
    setImage(null);
    setIsLoading(false);
    setShowOrignal(false);
    setProgress(0);
  };

  const removeBg = async () => {
    if (!image) return;
    setIsLoading(true);
    setShowOrignal(false);
    const formData = new FormData();
    formData.append('image', image?.image as File);

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
      setImage((prev) => ({
        ...prev!,
        result: data,
      }));
    } catch (err: any) {
      const error = err.response?.data?.message || 'An error occurred';
      toast.error(error);
      onClear();
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
    if (!image?.result?.id) return;

    if (image?.hdUrl) {
      window.open(image.hdUrl, '_blank');

      return;
    }

    premiumDownloadMutation.mutate(image?.result?.id);
  };

  useEffect(() => {
    if (image && image?.image) {
      removeBg();
    }
  }, [image?.image]);

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
  };
};
