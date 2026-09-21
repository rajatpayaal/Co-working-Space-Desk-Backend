import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class RolesService {
  static async getAllRoles() {
    return prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  static async createRole(name: string, description?: string) {
    const existing = await prisma.role.findUnique({ where: { name } });
    if (existing) {
      throw new AppError('Role name already exists', 400);
    }
    return prisma.role.create({ data: { name, description } });
  }

  static async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { permissions: { include: { permission: true } } },
    });
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  static async deleteRole(id: string) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return prisma.role.delete({ where: { id } });
  }
}
