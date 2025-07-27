import prisma from '@/config/prisma';
import { Prisma } from '@prisma/client';
import { Context, Env } from 'hono';
import { z } from 'zod';

import APIError from '@/lib/api-error';
import { uploadFile, deleteMediaFile } from '@/lib/uploader';
import { getUniqueFileName } from '@/lib/utils';

import { uploadProviders } from '../settings/setting-schema';
import settingServices from '../settings/setting-services';
import mediaSchema from './media-schema';

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

// Actualizamos createMedia para leer los nuevos campos del body
const createMedia = async (c: Context<Env, string>) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  // Convertir los valores de cadena a booleanos
  const isCustomBackground = body['isCustomBackground'] === 'true';
  const isPremium = body['isPremium'] === 'true';

  if (!file || !file.name) {
    throw new APIError('Please provide a valid file');
  }

  // Pasar los nuevos campos a uploadMedia
  return uploadMedia(file, undefined, true, isCustomBackground, isPremium);
};

const getMedia = async (id: string) => {
  return prisma.media.findUnique({
    where: {
      id,
    },
  });
};

const updateMedia = async (id: string, c: Context<Env, string>) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;
  // También podemos añadir la lógica para actualizar isCustomBackground/isPremium si fuera necesario
  // const isCustomBackground = body['isCustomBackground'] === 'true';
  // const isPremium = body['isPremium'] === 'true';

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
const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema> & { isCustomBackground?: boolean; isPremium?: boolean }) => {
  const { page, limit, search, sort, order, isCustomBackground, isPremium } = query;

  const where: Prisma.MediaWhereInput = {
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    }),
    libraryMedia: true, // Esto asegura que solo se muestren los medios de la librería
    ...(typeof isCustomBackground === 'boolean' && { isCustomBackground }), // Nuevo filtro
    ...(typeof isPremium === 'boolean' && { isPremium }), // Nuevo filtro
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
