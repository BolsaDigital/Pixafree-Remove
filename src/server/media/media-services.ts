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

const uploadMedia = async (file: File, userId?: string, libraryMedia?: boolean) => {
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
    },
  });

  return media;
};

const createMedia = async (c: Context<Env, string>) => {
  const body = await c.req.parseBody();
  const file = body['file'] as File;

  if (!file || !file.name) {
    throw new APIError('Please provide a valid file');
  }

  return uploadMedia(file, undefined, true);
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

const queryMedia = async (query: z.infer<typeof mediaSchema.mediaQuerySchema>) => {
  const { page, limit, search, sort, order } = query;

  const where: Prisma.MediaWhereInput = {
    ...(search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    }),
    libraryMedia: true,
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
