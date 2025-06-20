import * as crypto from 'crypto';

export function hash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function verifyHash(data: string, hash: string): boolean {
  return crypto.createHash('sha256').update(data).digest('hex') === hash;
}

export function generateRandomKey(length = 32): string {
  return crypto.randomBytes(length).toString('hex');
}
