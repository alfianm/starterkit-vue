import { prisma } from '../utils/prisma';
import type { Role, CreateRoleRequest, UpdateRoleRequest, Permission } from '@starter/shared';
import { validatePermissions } from '@starter/shared';

export class RoleService {
  async findAll(): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return roles.map(this.mapRoleToResponse);
  }

  async findById(id: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { id },
    });

    if (!role) return null;

    return this.mapRoleToResponse(role);
  }

  async findBySlug(slug: string): Promise<Role | null> {
    const role = await prisma.role.findUnique({
      where: { slug },
    });

    if (!role) return null;

    return this.mapRoleToResponse(role);
  }

  async create(data: CreateRoleRequest): Promise<Role> {
    const validPermissions = validatePermissions(data.permissions);

    const role = await prisma.role.create({
      data: {
        name: data.name,
        slug: data.slug,
        permissions: validPermissions,
      },
    });

    return this.mapRoleToResponse(role);
  }

  async update(id: string, data: UpdateRoleRequest): Promise<Role | null> {
    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) return null;

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.permissions) {
      updateData.permissions = validatePermissions(data.permissions);
    }

    const role = await prisma.role.update({
      where: { id },
      data: updateData,
    });

    return this.mapRoleToResponse(role);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.role.delete({ where: { id } });
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    return prisma.role.count();
  }

  private mapRoleToResponse(role: any): Role {
    return {
      id: role.id,
      name: role.name,
      slug: role.slug,
      permissions: role.permissions as Permission[],
      createdAt: role.createdAt.toISOString(),
      updatedAt: role.updatedAt.toISOString(),
    };
  }
}

export const roleService = new RoleService();
