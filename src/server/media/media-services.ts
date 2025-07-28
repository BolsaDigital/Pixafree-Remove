import prisma from '@/config/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod'; // Asegúrate de que 'zod' esté instalado si no lo está: npm install zod

import APIError from '@/lib/api-error';
import { uploadFile, deleteMediaFile } from '@/lib/uploader';
import { getUniqueFileName } from '@/lib/utils';

import { uploadProviders } from '../settings/setting-schema';
import settingServices from '../settings/setting-services';
import mediaSchema from './media-schema'; // Asumo que tienes un media-schema.ts

// Actualizamos uploadMedia para aceptar los nuevos parámetros
const uploadMedia = async (
  file: File,
  userId?: string,
  libraryMedia?: boolean,
  isCustomBackground: boolean = false, // Nuevo parámetro
  isPremium: boolean = false,          // Nuevo parámetro
) => {
  const uploadConfig = await settingServices.getSettings('upload');
  const fileName = getUniqueFileName(file.name);
  const { url, key } = await uploadFile(file, fileName, uploadConfig, true);
  const { size, type, name } = file;

  const media = await prisma.media.create({
    data: {
      name,
      mimeType: type,
      size,
      storageType: uploadConfig?.uploadProvider || uploadProviders[0],
      url,
      fileName,
      key,
      userId,
      libraryMedia,
      isCustomBackground, // Guardar el nuevo campo
      isPremium,          // Guardar el nuevo campo
    },
  });

  return media;
};

// createMedia ahora toma los parámetros directamente, no un 'Context' de Hono
const createMedia = async (
  file: File,
  isCustomBackground: boolean,
  isPremium: boolean,
  userId?: string
) => {
  if (!file || !file.name) {
    throw new APIError('Please provide a valid file');
  }

  // Pasar los nuevos campos a uploadMedia
  return uploadMedia(file, userId, true, isCustomBackground, isPremium);
};

const getMedia = async (id: string) => {
  return prisma.media.findUnique({
    where: {
      id,
    },
  });
};

// updateMedia también toma los parámetros directamente
const updateMedia = async (
  id: string,
  file: File,
  // Si necesitas actualizar isCustomBackground/isPremium en el futuro, agrégalos aquí
  // isCustomBackground?: boolean,
  // isPremium?: boolean
) => {
  if (!file || !file.name) {
    throw new APIError('Please provide a valid file');
  }

  const media = await getMedia(id);

  if (!media) {
    throw new APIError('Media not found');
  }

  // match file type
  if (media.mimeType !== file.type) {
    throw new APIError('File type mismatch');
  }

  // delete old file
  await deleteMediaFile(media);

  const uploadConfig = await settingServices.getSettings('upload');
  const { url, key } = await uploadFile(file, media.fileName, uploadConfig, true);
  const { size } = file;

  const updatedMedia = await prisma.media.update({
    where: {
      id,
    },
    data: {
      size,
      storageType: uploadConfig?.uploadProvider || uploadProviders[0],
      url,
      key,
      // Aquí podrías añadir isCustomBackground y isPremium si se permitiera actualizarlos
      // isCustomBackground: isCustomBackground,
      // isPremium: isPremium,
    },
  });

  return updatedMedia;
};

const deleteMedia = async (ids: string[]) => {
  const media = await prisma.media.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  await prisma.media.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  for (const m of media) {
    await deleteMediaFile(m);
  }

  return media;
};

// Modificamos queryMedia para permitir filtrar por isCustomBackground y isPremium
// y para que libraryMedia sea opcional en el filtro where
const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema> & {
  isCustomBackground?: boolean;
  isPremium?: boolean;
}) => {
  const { page, limit, search, sort, order, libraryMedia, isCustomBackground, isPremium } = query;

  const where: Prisma.MediaWhereInput = {
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    }),
    // libraryMedia solo se aplica si está definido explícitamente
    ...(libraryMedia !== undefined && { libraryMedia }),
    ...(isCustomBackground !== undefined && { isCustomBackground }), // Nuevo filtro
    ...(isPremium !== undefined && { isPremium }), // Nuevo filtro
  };

  const [docs, total] = await Promise.all([
    prisma.media.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        [sort || 'createdAt']: order || 'desc',
      },
    }),
    prisma.media.count({
      where,
    }),
  ]);

  const pagination = {
    page,
    limit,
    totalDocs: total,
    totalPages: Math.ceil(total / limit),
  };

  return {
    docs,
    pagination,
  };
};

export default {
  uploadMedia,
  createMedia,
  updateMedia,
  getMedia,
  deleteMedia,
  queryMedia,
};