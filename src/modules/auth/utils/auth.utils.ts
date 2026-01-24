import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export function generateRefreshToken(): string {
    return crypto.randomUUID() + crypto.randomUUID();
}

export async function hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
}

export async function compareToken(
    token: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(token, hash);
}
