import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

// Helper: get user's permissions from their role
async function getUserPermissions(roleId: string | null): Promise<string[]> {
  if (!roleId) return [];
  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: { select: { action: true } } },
  });
  return rolePerms.map((rp) => rp.permission.action);
}

export class UsersService {
  // 34. List Users (Admin)
  static async getAllUsers(
    filters: {
      search?: string;
      roleId?: string;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (filters.isActive !== undefined) where.isActive = filters.isActive;
    if (filters.roleId) where.roleId = filters.roleId;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const allowedSort = ['createdAt', 'name', 'email'];
    const sortBy = allowedSort.includes(filters.sortBy ?? '') ? filters.sortBy! : 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          role: { select: { id: true, name: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 35. Get User Details (Admin)
  static async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        roleId: true,
        role: { select: { id: true, name: true, description: true } },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const permissions = await getUserPermissions(user.roleId);

    return {
      ...user,
      permissions,
    };
  }

  // 36. Update User Details (Admin)
  static async updateUser(
    id: string,
    data: Partial<{ name: string; phone: string; email: string; roleId: string | null }>
  ) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) throw new AppError('Email address is already in use by another user', 400);
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        role: { select: { id: true, name: true } },
        updatedAt: true,
      },
    });
  }

  // 37 & 38. Activate / Deactivate User Status (Admin)
  static async updateUserStatus(id: string, isActive: boolean) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);

    return prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, name: true, email: true, isActive: true, updatedAt: true },
    });
  }
}
