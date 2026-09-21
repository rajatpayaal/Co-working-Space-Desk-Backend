import { prisma } from '../../config/prisma.js';

export class PermissionsService {
  static async getAllPermissions() {
    return prisma.permission.findMany();
  }

  static async getRolePermissions(roleId: string) {
    return prisma.rolePermission.findMany({
      where: { roleId },
      include: { permission: true },
    });
  }

  static async assignRolePermissions(roleId: string, permissionIds: string[]) {
    await prisma.rolePermission.deleteMany({ where: { roleId } });
    const records = permissionIds.map((id) => ({
      roleId,
      permissionId: id,
    }));
    return prisma.rolePermission.createMany({ data: records });
  }
}
