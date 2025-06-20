export const AUTH_COOKIE_NAME = 'session_token';
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
} as const;
// all times are in seconds
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days
export const EMAIL_VERIFICATION_TOKEN_EXPIRES_IN = 60 * 20; // 20 minutes
export const PASSWORD_RESET_TOKEN_EXPIRES_IN = 60 * 20; // 20 minutes
export const PASSWORD_MIN_LENGTH = 6;

// upload constants
export const LOCAL_UPLOAD_DIR = 'uploads';
export const LOCAL_MEDIA_PREFIX = 'media';
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/tiff',
];
export const ALLOWED_ADMIN_UPLOAD_TYPES = ['image/', 'video/'];
export const PREVIEW_MAX_SIZE = 600;
