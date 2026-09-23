import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class RolesService {
  // 39. List Roles (Admin)
  static async getAllRoles(filters: { search?: string; page?: number; limit?: number } = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 50;
    const skip = (page - 1) * limit;

    const where = filters.search
      ? { name: { contains: filters.search, mode: 'insensitive' as const } }
      : {};

    const [roles, total] = await Promise.all([
      prisma.role.findMany({
        where,
        skip,
        take: limit,
        include: {
          permissions: {
            include: { permission: { select: { id: true, action: true, description: true } } },
          },
          _count: { select: { users: true } },
        },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.role.count({ where }),
    ]);

    const data = roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      userCount: r._count.users,
      permissions: r.permissions.map((rp) => rp.permission),
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    return {
      data,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 40. Create Role (Admin)
  static async createRole(name: string, description?: string) {
    const existing = await prisma.role.findUnique({ where: { name: name.toUpperCase() } });
    if (existing) throw new AppError('Role with this name already exists', 400);

    return prisma.role.create({
      data: { name: name.toUpperCase(), description },
    });
  }

  // 41. Get Role Details (Admin)
  static async getRoleById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: { select: { id: true, action: true, description: true } } },
        },
        _count: { select: { users: true } },
      },
    });

    if (!role) throw new AppError('Role not found', 404);

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      userCount: role._count.users,
      permissions: role.permissions.map((rp) => rp.permission),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  // 42. Update Role (Admin)
  static async updateRole(id: string, data: { name?: string; description?: string }) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError('Role not found', 404);

    if (data.name && data.name.toUpperCase() !== role.name) {
      const existing = await prisma.role.findUnique({ where: { name: data.name.toUpperCase() } });
      if (existing) throw new AppError('Role name already exists', 400);
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
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });
    if (!role) throw new AppError('Role not found', 404);
    if (role._count.users > 0) {
      throw new AppError(`Cannot delete role "${role.name}" — it is assigned to ${role._count.users} user(s)`, 400);
    }

    return prisma.role.delete({ where: { id } });
  }

  // 44. Get Role Permissions
  static async getRolePermissions(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
    if (!role) throw new AppError('Role not found', 404);

    return {
      role: { id: role.id, name: role.name },
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        action: rp.permission.action,
        description: rp.permission.description,
        module: rp.permission.action.split(':')[0],
      })),
    };
  }

  // 45. Set Role Permissions (Full Replace via PUT)
  static async setRolePermissions(id: string, permissionIds: string[]) {
    const role = await prisma.role.findUnique({ where: { id } });
    if (!role) throw new AppError('Role not found', 404);

    // Validate all permission IDs exist
    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw new AppError('One or more permission IDs are invalid', 400);
    }

    // Full replace: delete existing, insert new
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: id } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId: id, permissionId })),
        skipDuplicates: true,
      }),
    ]);

    return this.getRolePermissions(id);
  }
}
