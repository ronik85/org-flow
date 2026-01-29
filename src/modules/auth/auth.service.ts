import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { EmailAlreadyExistsException } from 'src/common/exceptions/email-already-exists.exception';
import { SessionRevokedReason } from '../sessions/enums/session-revoked-reason.enum';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  fingerprintToken,
  generateRefreshToken,
  hashToken,
} from './utils/auth.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.usersService.findByEmail(dto.email);
    if (exists) throw new EmailAlreadyExistsException();

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return { id: user.id, name: user.name, email: user.email };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const refreshToken = generateRefreshToken();
    const refreshTtlDays =
      this.configService.get<number>('auth.refreshTokenTtlDays') ?? 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTtlDays);

    await this.sessionsService.createSession({
      userId: user.id,
      tokenFingerprint: fingerprintToken(refreshToken),
      tokenHash: await hashToken(refreshToken),
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(refreshToken: string) {
    const session = await this.sessionsService.findSessionByToken(refreshToken);
    if (!session) throw new UnauthorizedException('Invalid token');

    if (
      session.revokedAt &&
      session.revokedReason === SessionRevokedReason.ROTATED
    ) {
      await this.sessionsService.revokeAllForUser(
        session.userId,
        SessionRevokedReason.REUSE_DETECTED,
      );
      throw new UnauthorizedException('Reuse detected');
    }

    if (session.revokedAt || session.expiresAt < new Date())
      throw new UnauthorizedException('Expired');

    const user = await this.usersService.findById(session.userId);

    const newRefreshToken = generateRefreshToken();
    const refreshTtlDays =
      this.configService.get<number>('auth.refreshTokenTtlDays') ?? 7;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTtlDays);

    const newSession = await this.sessionsService.createSession({
      userId: user.id,
      tokenFingerprint: fingerprintToken(newRefreshToken),
      tokenHash: await hashToken(newRefreshToken),
      expiresAt,
    });

    await this.sessionsService.revokeSession(
      session.id,
      SessionRevokedReason.ROTATED,
      newSession.id,
    );

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return { accessToken, refreshToken: newRefreshToken };
  }
}
