import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateTokens, verifyRefreshToken } from '../utils/jwt';
import type { TokenPayload } from '../utils/jwt';
import type { LoginRequest, AuthResponse, User } from '@starter/shared';

const SALT_ROUNDS = 10;

export class AuthService {
  async login(data: LoginRequest): Promise<AuthResponse | null> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: { role: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return null;
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValidPassword) {
      return null;
    }

    const permissions = (user.role?.permissions as string[]) || [];
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      permissions: permissions as any,
    };

    const tokens = generateTokens(payload);

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      ...tokens,
      user: this.mapUserToResponse(user),
    };
  }

  async refresh(refreshToken: string): Promise<AuthResponse | null> {
    try {
      // Verify token signature
      const payload = verifyRefreshToken(refreshToken);
      
      // Check if token exists and is valid in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: { include: { role: true } } },
      });

      if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
        return null;
      }

      // Revoke old token
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { revokedAt: new Date() },
      });

      const permissions = (storedToken.user.role?.permissions as string[]) || [];
      
      const newPayload: TokenPayload = {
        userId: storedToken.user.id,
        email: storedToken.user.email,
        permissions: permissions as any,
      };

      const tokens = generateTokens(newPayload);

      // Store new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: storedToken.user.id,
          expiresAt,
        },
      });

      return {
        ...tokens,
        user: this.mapUserToResponse(storedToken.user),
      };
    } catch (error) {
      return null;
    }
  }

  async logout(refreshToken: string): Promise<boolean> {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { revokedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getMe(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) return null;

    return this.mapUserToResponse(user);
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private mapUserToResponse(user: any): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      status: user.status,
      roleId: user.roleId,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        slug: user.role.slug,
        permissions: user.role.permissions as any,
        createdAt: user.role.createdAt.toISOString(),
        updatedAt: user.role.updatedAt.toISOString(),
      } : undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}

export const authService = new AuthService();
