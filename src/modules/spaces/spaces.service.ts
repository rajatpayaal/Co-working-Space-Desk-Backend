import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export interface SpaceQueryFilters {
  search?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export class SpacesService {
  // List Spaces with Search, Filter & Pagination
  static async getAllSpaces(filters: SpaceQueryFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.minCapacity || filters.maxCapacity) {
      where.capacity = {};
      if (filters.minCapacity) where.capacity.gte = Number(filters.minCapacity);
      if (filters.maxCapacity) where.capacity.lte = Number(filters.maxCapacity);
    }

    if (filters.minPrice || filters.maxPrice) {
      where.pricePerHour = {};
      if (filters.minPrice) where.pricePerHour.gte = Number(filters.minPrice);
      if (filters.maxPrice) where.pricePerHour.lte = Number(filters.maxPrice);
    }

    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.space.count({ where }),
    ]);

    return {
      spaces,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get Space Details by ID (with admin option for full history)
  static async getSpaceById(id: string, includeFullHistory: boolean = false) {
    const space = await prisma.space.findUnique({
      where: { id },
      include: {
        maintenances: includeFullHistory
          ? { orderBy: { startTime: 'desc' } }
          : { where: { endTime: { gte: new Date() } } },
        bookings: includeFullHistory
          ? {
              include: { user: { select: { id: true, name: true, email: true } } },
              orderBy: { createdAt: 'desc' },
            }
          : false,
      },
    });

    if (!space) {
      throw new AppError('Co-working space not found', 404);
    }

    return space;
  }

  // 20. Create Space (Admin)
  static async createSpace(data: {
    name: string;
    description?: string;
    capacity: number;
    pricePerHour: number;
  }) {
    return prisma.space.create({ data });
  }

  // 23. Update Space (Admin)
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

  // 24. Delete / Deactivate Space (Admin)
  static async deleteSpace(id: string) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    return prisma.space.update({ where: { id }, data: { isActive: false } });
  }
}
