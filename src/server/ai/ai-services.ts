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

import Replicate from 'replicate';

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
    version: 'f74986db0355b58403ed20963af156525e2891ea3c2d499bfbfb2a28cd87c5d7', // Versión del modelo de Replicate para remover fondo
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
    console.error('Error removing image background: No output URL received', responseData);
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

// Nueva función para generar escenas con IA usando Replicate
const generateScene = async (
  prompt: string,
  referenceImageBase64?: string, // Base64 de la imagen de referencia (opcional)
  userId?: string // Para asociar con el usuario si es necesario
) => {
  const aiSettings = await getSettings('ai');
  if (!aiSettings || !aiSettings.aiApiKey) {
    throw new APIError('AI settings not configured or Replicate API key missing.');
  }

  const replicate = new Replicate({
    auth: aiSettings.aiApiKey,
  });

  // Modelo de Replicate para generación de imágenes (Stable Diffusion XL)
  // Este modelo es bueno para texto a imagen. Para "reloj en persona",
  // un modelo de ControlNet sería más adecuado, pero requiere más complejidad.
  // Por ahora, nos enfocamos en que genere un fondo coherente.
  const model = "stability-ai/stable-diffusion-xl";
  const version = "39ed52f2a78e934ba35e2ce05cd5f6dcce5bc54203bc76bbcc7e10b963482a2d"; // Última versión estable al momento de escribir

  const input: { prompt: string; image?: string; } = {
    prompt: prompt,
    // Si el modelo de Replicate que elijas soporta 'init_image' para image-to-image,
    // y quieres usar la imagen de referencia directamente, la añadirías aquí.
    // Por ahora, Stable Diffusion XL es principalmente texto a imagen.
    // La descripción de Gemini ya se incorpora en el 'prompt'.
    // Si usaras un modelo como 'stability-ai/stable-diffusion-img2img', podrías usar:
    // init_image: referenceImageBase64,
    // prompt: prompt,
    // strength: 0.8, // Qué tan fuerte se adhiere a la imagen de entrada
  };

  console.log("Calling Replicate for scene generation with prompt:", prompt);
  if (referenceImageBase64) {
    console.log("Reference image provided (base64).");
  }

  try {
    const prediction = await replicate.predictions.create({
      model: model,
      version: version,
      input: input,
    });

    // Replicate's API client automáticamente maneja el polling para el resultado final.
    const result = await replicate.predictions.get(prediction.id);

    if (result.status !== 'succeeded' || !result.output || result.output.length === 0) {
      console.error('Replicate prediction failed or no output:', result);
      throw new APIError('Failed to generate scene with AI. Please try again or refine your prompt.');
    }

    const generatedImageUrl = result.output[0]; // Asumiendo que la salida es un array de URLs

    // Descargar la imagen generada de Replicate
    const imageResponse = await fetch(generatedImageUrl);
    if (!imageResponse.ok) {
      throw new APIError('Failed to download generated image from Replicate.');
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Generar un nombre de archivo único
    const uniqueFileName = `ai-scene-${Date.now()}.png`;

    // Crear un File object para uploadMedia
    const generatedFile = new File([imageBuffer], uniqueFileName, {
      type: 'image/png',
      lastModified: Date.now(),
    });

    // Subir la imagen generada usando tu servicio de medios existente
    // La marcamos como libraryMedia: true, isCustomBackground: true, isPremium: false
    // para que aparezca en los fondos preestablecidos del editor.
    const uploadedMedia = await mediaServices.uploadMedia(generatedFile, userId, true, true, false);

    // Puedes guardar un registro de esta generación en tu historial si lo deseas
    // Por ahora, solo devolvemos la URL.
    return { url: uploadedMedia.url };

  } catch (error) {
    console.error('Error calling Replicate API for scene generation:', error);
    throw new APIError(`Error generating scene with AI: ${(error as Error).message || 'Unknown error'}`);
  }
};

export type GenerateSceneResponse = Awaited<ReturnType<typeof generateScene>>;

export default {
  removeImageBackground,
  unlockPremiumDownload,
  generateScene,
};
