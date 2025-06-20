import { SettingsDataMap } from '@/server/settings/setting-schema';
import settingServices from '@/server/settings/setting-services';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import APIError from '../api-error';

let s3Client: S3Client | null = null;
let config: SettingsDataMap['upload'] | null = null;

const initS3Client = (uploadConfig: SettingsDataMap['upload']) => {
  if (!s3Client) {
    s3Client = new S3Client({
      region: uploadConfig.s3Region || undefined,
      endpoint: uploadConfig.s3Endpoint,
      credentials: {
        accessKeyId: uploadConfig.s3AccessKeyId || '',
        secretAccessKey: uploadConfig.s3SecretAccessKey || '',
      },
    });
    config = uploadConfig;
  }

  if (JSON.stringify(config) !== JSON.stringify(uploadConfig)) {
    config = uploadConfig;
    s3Client.destroy();
    s3Client = new S3Client({
      region: uploadConfig.s3Region || undefined,
      endpoint: uploadConfig.s3Endpoint,
      credentials: {
        accessKeyId: uploadConfig.s3AccessKeyId || '',
        secretAccessKey: uploadConfig.s3SecretAccessKey || '',
      },
    });
  }
};

export const s3Uploader = async (
  file: File,
  fileName: string,
  uploadConfig: SettingsDataMap['upload'],
) => {
  initS3Client(uploadConfig);

  if (!s3Client) {
    throw new APIError('S3 client is not initialized');
  }

  let finalName = fileName;
  if (uploadConfig.s3Folder) {
    finalName = `${uploadConfig.s3Folder}/${fileName}`;
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const uploadParams = {
    Bucket: uploadConfig.s3Bucket,
    Key: finalName,
    Body: fileBuffer,
    ContentType: file.type,
    ContentDisposition: `attachment; filename="${fileName}"`,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new APIError('Failed to upload file');
  }

  let fileUrl = `${uploadConfig.s3Endpoint}/${uploadParams.Bucket}/${finalName}`;

  if (uploadConfig.s3CustomDomain) {
    fileUrl = `${uploadConfig.s3CustomDomain}/${finalName}`;
  }

  return { url: fileUrl, key: fileName };
};

export const deleteS3Media = async (key: string) => {
  const uploadConfig = await settingServices.getSettings('upload');

  if (!uploadConfig) {
    throw new APIError('Upload settings not found');
  }

  initS3Client(uploadConfig);

  if (!s3Client) {
    throw new APIError('S3 client is not initialized');
  }

  const deleteParams = {
    Bucket: uploadConfig.s3Bucket,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw new APIError('Failed to delete file');
  }

  return true;
};
