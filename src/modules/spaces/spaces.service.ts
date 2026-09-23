import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export interface SpaceQueryFilters {
  search?: string;
  type?: string;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

// Helper: compute a price alias and map response to match spec fields
function mapSpace(space: Record<string, unknown>) {
  return {
    ...space,
    price: space.pricePerHour,
  };
}

export class SpacesService {
  // List Spaces with Search, Filter & Pagination
  static async getAllSpaces(filters: SpaceQueryFilters = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.SpaceWhereInput = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.type) {
      where.type = { equals: filters.type, mode: 'insensitive' };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const capacityFilter = filters.capacity
      ? { gte: Number(filters.capacity) }
      : {
          ...(filters.minCapacity ? { gte: Number(filters.minCapacity) } : {}),
          ...(filters.maxCapacity ? { lte: Number(filters.maxCapacity) } : {}),
        };
    if (Object.keys(capacityFilter).length) {
      where.capacity = capacityFilter;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.pricePerHour = {
        ...(filters.minPrice ? { gte: Number(filters.minPrice) } : {}),
        ...(filters.maxPrice ? { lte: Number(filters.maxPrice) } : {}),
      };
    }

    const allowedSortFields = ['name', 'pricePerHour', 'capacity', 'createdAt'];
    const sortBy = allowedSortFields.includes(filters.sortBy ?? '') ? filters.sortBy! : 'createdAt';
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
      data: spaces.map(mapSpace),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get Space Details by ID
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

    return mapSpace(space as unknown as Record<string, unknown>);
  }

  // Create Space (Admin)
  static async createSpace(data: {
    name: string;
    type?: string;
    description?: string;
    capacity: number;
    pricePerHour: number;
    priceUnit?: string;
    location?: string;
    amenities?: string[];
    images?: string[];
    rules?: string[];
    isActive?: boolean;
  }) {
    const space = await prisma.space.create({ data });
    return mapSpace(space as unknown as Record<string, unknown>);
  }

  // Update Space (Admin)
  static async updateSpace(
    id: string,
    data: Partial<{
      name: string;
      type: string;
      description: string;
      capacity: number;
      pricePerHour: number;
      priceUnit: string;
      location: string;
      amenities: string[];
      images: string[];
      rules: string[];
      isActive: boolean;
    }>
  ) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    const updated = await prisma.space.update({ where: { id }, data });
    return mapSpace(updated as unknown as Record<string, unknown>);
  }

  // Delete / Deactivate Space (Admin)
  static async deleteSpace(id: string) {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }
    return prisma.space.update({ where: { id }, data: { isActive: false } });
  }
}
