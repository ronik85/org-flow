import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Session } from './entities/session.entity';
import { SessionRevokedReason } from './enums/session-revoked-reason.enum';
import { compareToken, fingerprintToken } from '../auth/utils/auth.utils';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  // ------------------ CREATE SESSION ------------------
  async createSession(params: {
    userId: string;
    tokenFingerprint: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<Session> {
    return this.sessionRepo.save({
      userId: params.userId,
      tokenHash: params.tokenHash,
      tokenFingerprint: params.tokenFingerprint,
      expiresAt: params.expiresAt,
    });
  }

  // ------------------ FIND SESSION BY REFRESH TOKEN ------------------
  async findSessionByToken(refreshToken: string): Promise<Session | null> {
    const fingerprint = fingerprintToken(refreshToken);

    const session = await this.sessionRepo.findOne({
      where: { tokenFingerprint: fingerprint },
    });

    if (!session) return null;

    const valid = await compareToken(refreshToken, session.tokenHash);
    return valid ? session : null;
  }

  // ------------------ REVOKE SINGLE SESSION ------------------
  async revokeSession(
    sessionId: string,
    reason: SessionRevokedReason,
    replacedBySessionId?: string,
  ): Promise<void> {
    await this.sessionRepo.update(sessionId, {
      revokedAt: new Date(),
      revokedReason: reason,
      replacedBySessionId: replacedBySessionId ?? null,
    });
  }

  // ------------------ REVOKE ALL SESSIONS FOR USER ------------------
  async revokeAllForUser(
    userId: string,
    reason: SessionRevokedReason,
  ): Promise<void> {
    await this.sessionRepo.update(
      { userId, revokedAt: IsNull() },
      { revokedAt: new Date(), revokedReason: reason },
    );
  }
}
