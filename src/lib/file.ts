import { fileTypeFromBuffer } from 'file-type';
import fs, { readFileSync } from 'fs'; // For handling file operations
import path from 'path';

const mimeTypeEstimate: any = {
  svg: 'image/svg+xml',
};

export const getFileByPath = async (filePath: string) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const data = readFileSync(filePath);
  const { size } = fs.statSync(filePath);
  const mimetype = await fileTypeFromBuffer(data);
  const ext = path.extname(filePath).slice(1);
  const mime = (await mimetype)?.mime || mimeTypeEstimate[ext];

  return { data, size, mime };
};
