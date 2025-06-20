import { ALLOWED_ADMIN_UPLOAD_TYPES, ALLOWED_IMAGE_TYPES } from '@/config/constants';
import { SettingsDataMap, UploadProvider } from '@/server/settings/setting-schema';
import { Media } from '@prisma/client';
import path from 'path';

import APIError from '@/lib/api-error';

import { deleteLocalMedia, localUploader } from './local-uploader';
import { deleteS3Media, s3Uploader } from './s3-uploader';

export const uploadFile = async (
  file: File,
  fileName: string,
  uploadConfig: SettingsDataMap['upload'] | null,
  isAdminUpload = false,
) => {
  const { type, name } = file;
  const ext = path.extname(name).toLowerCase()?.slice(1);

  if (uploadConfig) {
    // verify file type
    if (!ext) {
      throw new APIError('File type is not allowed');
    }

    if (isAdminUpload) {
      if (!ALLOWED_ADMIN_UPLOAD_TYPES.find((t) => type.startsWith(t))) {
        throw new APIError('File type is not allowed');
      }
    } else {
      if (!ALLOWED_IMAGE_TYPES.find((t) => type.startsWith(t))) {
        throw new APIError('File type is not allowed');
      }
    }
  }

  // handle file upload
  switch (uploadConfig?.uploadProvider) {
    case 's3':
      return s3Uploader(file, fileName, uploadConfig as SettingsDataMap['upload']);
    default:
      return localUploader(file, fileName);
  }
};

export const deleteMediaFile = async (media: Media) => {
  switch (media.storageType as UploadProvider) {
    case 's3':
      return deleteS3Media(media.key);
    default:
      return deleteLocalMedia(media.key);
  }
};
