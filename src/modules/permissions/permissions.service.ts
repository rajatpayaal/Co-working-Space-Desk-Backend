import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class PermissionsService {
  // 44. List Permissions (Admin)
  static async getAllPermissions() {
    return prisma.permission.findMany({
      orderBy: { action: 'asc' },
    });
  }

  // 45. Get Role Permissions (Admin)
  static async getRolePermissions(roleId: string) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });

    return {
      role: { id: role.id, name: role.name, description: role.description },
      permissions: rolePermissions.map((rp) => rp.permission),
    };
  }

  // 46. Assign / Update Role Permissions (Admin)
  static async assignRolePermissions(roleId: string, permissionIds: string[]) {
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new AppError('Role not found', 404);
    }

    // Verify all permission IDs exist
    const validPermissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });

    if (validPermissions.length !== permissionIds.length) {
      throw new AppError('One or more permission IDs provided are invalid', 400);
    }

    // Atomically replace role permissions
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      }),
    ]);

    return this.getRolePermissions(roleId);
  }
}
