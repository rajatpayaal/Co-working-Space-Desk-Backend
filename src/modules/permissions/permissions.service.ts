import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

// Derive module name from permission action (e.g. "spaces:create" → "spaces")
function deriveModule(action: string): string {
  return action.split(':')[0];
}

export class PermissionsService {
  // GET /api/admin/permissions?search&module&page&limit
  static async getAllPermissions(
    filters: { search?: string; module?: string; page?: number; limit?: number } = {}
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 100;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    // Filter by module prefix (e.g. module=spaces → action starts with "spaces:")
    if (filters.module) {
      where.action = { startsWith: `${filters.module}:`, mode: 'insensitive' };
    }

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { action: 'asc' },
      }),
      prisma.permission.count({ where }),
    ]);

    return {
      data: permissions.map((p) => ({
        id: p.id,
        action: p.action,
        name: p.action,           // alias for UI compatibility
        description: p.description,
        module: deriveModule(p.action),
        createdAt: p.createdAt,
      })),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // GET /api/admin/roles/:roleId/permissions
  static async getRolePermissions(roleId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    return {
      role: { id: role.id, name: role.name },
      permissions: rolePermissions.map((rp) => ({
        id: rp.permission.id,
        action: rp.permission.action,
        name: rp.permission.action,
        description: rp.permission.description,
        module: deriveModule(rp.permission.action),
      })),
    };
  }

  // PUT /api/admin/roles/:roleId/permissions — full replacement
  static async assignRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) throw new AppError('Role not found', 404);

    const validPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (validPermissions.length !== permissionIds.length) {
      throw new AppError('One or more permission IDs provided are invalid', 400);
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      }),
    ]);

    return this.getRolePermissions(roleId);
  }
}
