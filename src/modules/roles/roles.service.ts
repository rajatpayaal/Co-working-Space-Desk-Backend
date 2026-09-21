import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class RolesService {
  // 39. List Roles (Admin)
  static async getAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // 40. Create Role (Admin)
  static async createRole(name: string, description?: string) {
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('Role with this name already exists', 400);
    }
    return prisma.role.create({
      data: { name: name.toUpperCase(), description },
    });
  }

  // 41. Get Role Details (Admin)
  static async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: { include: { permission: true } },
        users: { select: { id: true, name: true, email: true } },
      },
    });

    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return role;
  }

  // 42. Update Role (Admin)
  static async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    if (data.name && data.name.toUpperCase() !== role.name) {
      const existing = await prisma.role.findUnique({
        where: { name: data.name.toUpperCase() },
      });
      if (existing) {
        throw new AppError('Role name already exists', 400);
      }
    }

    return prisma.role.update({
      where: { id },
      data: {
        name: data.name ? data.name.toUpperCase() : role.name,
        description: data.description !== undefined ? data.description : role.description,
      },
    });
  }

  // 43. Delete Role (Admin)
  static async deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    return prisma.role.delete({ where: { id } });
  }
}
