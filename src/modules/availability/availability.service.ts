import { prisma } from '../../config/prisma.js';

export class AvailabilityService {
  static async checkAvailability(spaceId: string, startTime: Date, endTime: Date) {
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        spaceId,
        status: { in: ['APPROVED', 'PENDING'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    const overlappingMaintenances = await prisma.maintenance.findMany({
      where: {
        spaceId,
        OR: [
          { startTime: { lte: startTime }, endTime: { gt: startTime } },
          { startTime: { lt: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    const isAvailable = overlappingBookings.length === 0 && overlappingMaintenances.length === 0;

    return {
      spaceId,
      startTime,
      endTime,
      isAvailable,
      conflicts: {
        bookingsCount: overlappingBookings.length,
        maintenanceCount: overlappingMaintenances.length,
      },
    };
  }

  static async getCalendar(spaceId?: string) {
    const where: any = {};
    if (spaceId) where.spaceId = spaceId;

    const bookings = await prisma.booking.findMany({
      where: { ...where, status: 'APPROVED' },
      select: { id: true, spaceId: true, startTime: true, endTime: true },
    });

    const maintenances = await prisma.maintenance.findMany({
      where,
      select: { id: true, spaceId: true, startTime: true, endTime: true, reason: true },
    });

    return { bookings, maintenances };
  }
}
