import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class MaintenanceService {
  static async getAllMaintenance() {
    return prisma.maintenance.findMany({
      include: { space: true },
      orderBy: { startTime: 'desc' },
    });
  }

  static async createMaintenance(spaceId: string, startTime: Date, endTime: Date, reason?: string) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new AppError('Space not found', 404);
    }

    return prisma.maintenance.create({
      data: {
        spaceId,
        startTime,
        endTime,
        reason,
      },
    });
  }

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

  static async deleteMaintenance(id: string) {
    const record = await prisma.maintenance.findUnique({ where: { id } });
    if (!record) {
      throw new AppError('Maintenance record not found', 404);
    }
    return prisma.maintenance.delete({ where: { id } });
  }
}
