import { MaxFileSizeType } from '@/server/settings/setting-schema';
import { clsx, type ClassValue } from 'clsx';
import getSymbolFromCurrency from 'currency-symbol-map';
import path from 'path';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateRandomString = (length = 16) => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getUniqueFileName = (fileName: string) => {
  const timestamp = Date.now();
  const { name, ext } = path.parse(fileName);
  const formattedName = name.replace(/[^a-z0-9]/gi, '-').toLowerCase();

  return `${formattedName}-${timestamp}${ext}`;
};

export const toCapitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const toSlug = (str: string) => {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-');
};

export const getCurrencySymbol = (currency?: string | null) => {
  const symbol = getSymbolFromCurrency(currency || 'USD');

  return symbol ? symbol : currency ? currency : 'USD';
};

export const formatAmount = (amount: number, currency?: string | null) => {
  const symbol = getCurrencySymbol(currency);

  return `${symbol} ${amount}`;
};

export const secondsToDateTime = (secs: number) => {
  const t = new Date(+0);
  t.setSeconds(secs);

  return t;
};

export const getUploadSizeInBytes = (size: number, sizeType: MaxFileSizeType) => {
  switch (sizeType) {
    case 'kb':
      return size * 1024;
    case 'mb':
      return size * 1024 * 1024;
    case 'gb':
      return size * 1024 * 1024 * 1024;
    default:
      return size;
  }
};
