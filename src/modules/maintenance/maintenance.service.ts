import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class MaintenanceService {
  // 29. List Maintenance Windows (Admin)
  static async getAllMaintenance(filters: { spaceId?: string; page?: number; limit?: number } = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.MaintenanceWhereInput = {};
    if (filters.spaceId) {
      where.spaceId = filters.spaceId;
    }

    const [records, total] = await Promise.all([
      prisma.maintenance.findMany({
        where,
        skip,
        take: limit,
        include: {
          space: { select: { id: true, name: true, capacity: true } },
        },
        orderBy: { startTime: 'desc' },
      }),
      prisma.maintenance.count({ where }),
    ]);

    return {
      records,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 30. Create Maintenance Window (Admin)
  static async createMaintenance(spaceId: string, startTime: Date, endTime: Date, reason?: string) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new AppError('Co-working space not found', 404);
    }

    return prisma.maintenance.create({
      data: {
        spaceId,
        startTime,
        endTime,
        reason,
      },
      include: {
        space: { select: { id: true, name: true } },
      },
    });
  }

  // 31. Get Maintenance Details (Admin)
  static async getMaintenanceById(id: string) {
    const record = await prisma.maintenance.findUnique({
      where: { id },
      include: { space: true },
    });

    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }

    return record;
  }

  // 32. Update Maintenance Window (Admin)
  static async updateMaintenance(
    id: string,
    data: { startTime?: Date; endTime?: Date; reason?: string }
  ) {
    const record = await prisma.maintenance.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }

    const startTime = data.startTime ? new Date(data.startTime) : record.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : record.endTime;

    if (startTime >= endTime) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    return prisma.maintenance.update({
      where: { id },
      data: {
        startTime,
        endTime,
        reason: data.reason !== undefined ? data.reason : record.reason,
      },
      include: { space: true },
    });
  }

  // 33. Delete Maintenance Window (Admin)
  static async deleteMaintenance(id: string) {
    const record = await prisma.maintenance.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }

    return prisma.maintenance.delete({ where: { id } });
  }
}
