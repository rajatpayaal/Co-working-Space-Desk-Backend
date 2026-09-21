import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class SpacesService {
  static async getAllSpaces(filters?: { isActive?: boolean; search?: string }) {
    const where: any = {};
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }
    return prisma.space.findMany({ where });
  }

  static async getSpaceById(id: string) {
    const space = await prisma.space.findUnique({
      where: { id },
      include: { maintenances: true },
    });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    return space;
  }

  static async createSpace(data: {
    name: string;
    description?: string;
    capacity: number;
    pricePerHour: number;
  }) {
    return prisma.space.create({ data });
  }

  static async updateSpace(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      capacity: number;
      pricePerHour: number;
      isActive: boolean;
    }>
  ) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    return prisma.space.update({ where: { id }, data });
  }

  static async deleteSpace(id: string) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    return prisma.space.update({ where: { id }, data: { isActive: false } });
  }
}
