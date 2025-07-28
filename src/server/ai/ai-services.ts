import { ALLOWED_IMAGE_TYPES, PREVIEW_MAX_SIZE } from '@/config/constants';
import prisma from '@/config/prisma';
import sizeOf from 'buffer-image-size';
import { Context, Env } from 'hono';
import moment from 'moment';
import fetch from 'node-fetch';
import sharp from 'sharp';

import APIError from '@/lib/api-error';
import { getUploadSizeInBytes } from '@/lib/utils';

import creditServices from '../credits/credit-services';
import mediaServices from '../media/media-services';
import { getSettings } from '../settings/setting-services';
import subscriptionServices from '../subscriptions/subscription-services';

const removeImageBackground = async (c: Context<Env, string>, userId?: string) => {
  const body = await c.req.parseBody();
  const image = body['image'] as File | undefined;

  if (!image) {
    throw new APIError('Image is required');
  }

  let expiredAt = moment().add(1, 'days').toDate();
  if (userId) {
    const subscription = await subscriptionServices.getUserSubscription(userId);
    if (subscription) {
      expiredAt = moment().add(30, 'days').toDate();
    } else {
      expiredAt = moment().add(7, 'days').toDate();
    }
  }

  if (!image?.type) {
    throw new APIError('Invalid image file');
  }

  const [uploadSettings, aiSettings] = await Promise.all([
    getSettings('upload'),
    getSettings('ai'),
  ]);
  if (!uploadSettings || !aiSettings) {
    console.error('Please configure upload and ai settings');
    throw new APIError('Something went wrong');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    throw new APIError('Invalid image type');
  }

  const maxSize = getUploadSizeInBytes(uploadSettings.maxFileSize, uploadSettings.maxFileSizeType);
  if (image.size > maxSize) {
    throw new APIError(
      `Image size should be less than ${uploadSettings.maxFileSize}${uploadSettings.maxFileSizeType}`,
    );
  }

  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const imageData = `data:${image.type};base64,${base64}`;

  const input = {
    version: 'f74986db0355b58403ed20963af156525e2891ea3c2d499bfbfb2a28cd87c5d7',
    input: {
      image: imageData,
    },
  };

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Prefer: 'wait',
      Authorization: `Bearer ${aiSettings.aiApiKey}`,
    },
    body: JSON.stringify(input),
  });

  const responseData = (await response.json()) as any;

  if (!response.ok) {
    console.error('Error removing image background:', responseData);
    throw new APIError('Error removing image background. Please try again later.');
  }

  const outputUrl = responseData?.output;
  if (!outputUrl) {
    console.error('Error removing image background:', responseData);
    throw new APIError('Error removing image background. Please try again later.');
  }

  const fileName = image.name?.split('.')?.[0] || 'image';
  const inputMedia = await mediaServices.uploadMedia(image);

  const outputArrayBuffer = await fetch(outputUrl).then((res) => res.arrayBuffer());
  const outputBuffer = Buffer.from(outputArrayBuffer);
  const outputDimensions = sizeOf(outputBuffer);
  const outputFile = new File([outputBuffer], `${fileName}.png`, {
    type: 'image/png',
    lastModified: Date.now(),
  });
  const outputMedia = await mediaServices.uploadMedia(outputFile);

  const previewImage = await sharp(outputBuffer)
    .resize({
      width: PREVIEW_MAX_SIZE,
      height: PREVIEW_MAX_SIZE,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .toFormat('png')
    .toBuffer();
  const previewDimensions = sizeOf(previewImage);
  const previewFile = new File([previewImage], `${fileName}-preview.png`, {
    type: 'image/png',
    lastModified: Date.now(),
  });
  const previewMedia = await mediaServices.uploadMedia(previewFile);

  const history = await prisma.history.create({
    data: {
      userId: userId,
      inputMediaId: inputMedia?.id,
      previewMediaId: previewMedia?.id,
      outputMediaId: outputMedia?.id,
      peviewHeight: previewDimensions.height,
      previewWidth: previewDimensions.width,
      outputHeight: outputDimensions.height,
      outputWidth: outputDimensions.width,
      expiredAt,
    },
  });

  return {
    id: history.id,
    preview: previewMedia.url,
    previewWidth: previewDimensions.width,
    previewHeight: previewDimensions.height,
    outputWidth: outputDimensions.width,
    outputHeight: outputDimensions.height,
  };
};

export type RemoveBgResponse = Awaited<ReturnType<typeof removeImageBackground>>;

const unlockPremiumDownload = async (historyId: string, userId?: string) => {
  if (!userId) {
    throw new APIError('Please login to download hd image');
  }

  const history = await prisma.history.findUnique({
    where: {
      id: historyId,
    },
    include: {
      outputMedia: true,
    },
  });

  if (!history) {
    throw new APIError('Image not found');
  }

  const { credits, id: creditsId } = await creditServices.getUserCredits(userId);
  if (!credits || credits <= 0) {
    throw new APIError('You do not have enough credits to download this image');
  }

  await prisma.$transaction(async (tx) => {
    if (creditsId) {
      await tx.credits.update({
        where: {
          id: creditsId,
        },
        data: {
          used: {
            increment: 1,
          },
        },
      });
    }

    await tx.history.update({
      where: {
        id: historyId,
      },
      data: {
        unlocked: true,
      },
    });
  });

  const { outputMedia } = history;
  if (!outputMedia) {
    throw new APIError('Image not found');
  }
  const { url } = outputMedia;

  return {
    url,
  };
};

export default {
  removeImageBackground,
  unlockPremiumDownload,
};
