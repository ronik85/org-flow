import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Session } from './entities/session.entity';
import { SessionRevokedReason } from './enums/session-revoked-reason.enum';
import { compareToken } from '../auth/utils/auth.utils';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>,
    ) { }

    // ------------------ CREATE SESSION ------------------
    async createSession(params: {
        userId: string;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<Session> {
        return this.sessionRepo.save({
            userId: params.userId,
            tokenHash: params.tokenHash,
            expiresAt: params.expiresAt,
        });
    }

    // ------------------ FIND ACTIVE SESSIONS FOR USER ------------------
    async findAllActiveForUser(userId: string): Promise<Session[]> {
        return this.sessionRepo.find({
            where: { userId, revokedAt: IsNull() },
        });
    }

    // ------------------ FIND SESSION BY USERID + REFRESH TOKEN ------------------
    async findByUserIdAndToken(userId: string, refreshToken: string): Promise<Session | null> {
        const sessions = await this.findAllActiveForUser(userId);

        for (const session of sessions) {
            const isMatch = await compareToken(refreshToken, session.tokenHash);
            if (isMatch) return session;
        }

        return null;
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
    async revokeAllForUser(userId: string, reason: SessionRevokedReason): Promise<void> {
        await this.sessionRepo.update(
            { userId, revokedAt: IsNull() },
            { revokedAt: new Date(), revokedReason: reason },
        );
    }
}
