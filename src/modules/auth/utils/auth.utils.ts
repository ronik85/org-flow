import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export function generateRefreshToken(): string {
  return crypto.randomUUID() + crypto.randomUUID();
}

export async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export function fingerprintToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function compareToken(
  token: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
