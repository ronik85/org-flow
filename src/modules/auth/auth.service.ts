import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { EmailAlreadyExistsException } from 'src/common/exceptions/email-already-exists.exception';
import { SessionsService } from '../sessions/sessions.service';
import { UsersService } from '../users/users.service';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { generateRefreshToken, hashToken, compareToken } from './utils/auth.utils';
import { SessionRevokedReason } from '../sessions/enums/session-revoked-reason.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  // ------------------ REGISTER ------------------
  async register(dto: RegisterDto) {
    const userExists = await this.usersService.findByEmail(dto.email);
    if (userExists) throw new EmailAlreadyExistsException();

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  // ------------------ LOGIN ------------------
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    // Payload for access token
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload);

    // Generate and hash refresh token
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = await hashToken(refreshToken);

    const refreshTtlDays = this.configService.get<number>('auth.refreshTokenTtlDays') ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTtlDays);

    await this.sessionsService.createSession({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email },
    };
  }

  // ------------------ REFRESH TOKENS ------------------
  async refreshTokens(userId: string, refreshToken: string) {
    const matchedSession = await this.sessionsService.findByUserIdAndToken(userId, refreshToken);

    if (!matchedSession) throw new UnauthorizedException('Invalid refresh token');
    if (matchedSession.revokedAt || matchedSession.expiresAt < new Date())
      throw new UnauthorizedException('Refresh token expired or revoked');

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = await hashToken(newRefreshToken);

    const refreshTtlDays = this.configService.get<number>('auth.refreshTokenTtlDays') ?? 7;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshTtlDays);

    const newSession = await this.sessionsService.createSession({
      userId: matchedSession.userId,
      tokenHash: newTokenHash,
      expiresAt,
    });

    await this.sessionsService.revokeSession(
      matchedSession.id,
      SessionRevokedReason.ROTATED,
      newSession.id,
    );

    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
