import { LOCAL_MEDIA_PREFIX, LOCAL_UPLOAD_DIR } from '@/config/constants';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), LOCAL_UPLOAD_DIR);

const createUploadDir = () => {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }
};

export const localUploader = async (file: File, fileName: string) => {
  createUploadDir();
  const filePath = path.join(uploadDir, fileName);
  const fileUrl = process.env.NEXT_PUBLIC_BASE_URL + `/api/${LOCAL_MEDIA_PREFIX}/` + fileName;
  const arrayBuffer = await file.arrayBuffer();

  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

  return { url: fileUrl, key: fileName };
};

export const deleteLocalMedia = async (key: string) => {
  const filePath = path.join(uploadDir, key);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
