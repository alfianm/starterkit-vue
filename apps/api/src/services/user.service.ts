import { prisma } from '../utils/prisma';
import { authService } from './auth.service';
import type { User, CreateUserRequest, UpdateUserRequest, UserFilterParams } from '@starter/shared';
import { parsePagination } from '@starter/shared';

export class UserService {
  async findAll(params: UserFilterParams) {
    const { page, limit } = parsePagination(params.page, params.limit);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.roleId) {
      where.roleId = params.roleId;
    }

    if (params.status) {
      where.status = params.status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(this.mapUserToResponse),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!user) return null;

    return this.mapUserToResponse(user);
  }

  async create(data: CreateUserRequest): Promise<User> {
    const passwordHash = await authService.hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        status: data.status,
        roleId: data.roleId || null,
      },
      include: { role: true },
    });

    return this.mapUserToResponse(user);
  }

  async update(id: string, data: UpdateUserRequest): Promise<User | null> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) return null;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.status && { status: data.status }),
        ...(data.roleId !== undefined && { roleId: data.roleId || null }),
      },
      include: { role: true },
    });

    return this.mapUserToResponse(user);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  async assignRole(userId: string, roleId: string): Promise<User | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { roleId },
      include: { role: true },
    });

    return this.mapUserToResponse(user);
  }

  async count(): Promise<number> {
    return prisma.user.count();
  }

  async countActive(): Promise<number> {
    return prisma.user.count({ where: { status: 'ACTIVE' } });
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

export const userService = new UserService();
