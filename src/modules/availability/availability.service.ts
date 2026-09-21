import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

export class AvailabilityService {
  // 11. Check Space Availability
  static async checkAvailability(spaceId: string, startTime: Date, endTime: Date) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space || !space.isActive) {
      throw new AppError('Co-working space not found or deactivated', 404);
    }

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
      spaceName: space.name,
      startTime,
      endTime,
      isAvailable,
      conflicts: {
        bookingsCount: overlappingBookings.length,
        maintenanceCount: overlappingMaintenances.length,
      },
    };
  }

  // 12. View Space Availability for a Date
  static async getSpaceAvailability(spaceId: string, targetDateStr?: string) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new AppError('Co-working space not found', 404);
    }

    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const bookings = await prisma.booking.findMany({
      where: {
        spaceId,
        status: { in: ['APPROVED', 'PENDING'] },
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
      select: { id: true, startTime: true, endTime: true, status: true },
    });

    const maintenances = await prisma.maintenance.findMany({
      where: {
        spaceId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
      select: { id: true, startTime: true, endTime: true, reason: true },
    });

    return {
      space: { id: space.id, name: space.name, capacity: space.capacity, pricePerHour: space.pricePerHour },
      date: startOfDay.toISOString().split('T')[0],
      bookings,
      maintenances,
      totalOccupiedWindows: bookings.length + maintenances.length,
    };
  }

  // 13. View Available Time Slots
  static async getAvailableTimeSlots(spaceId: string, targetDateStr?: string, slotDurationMinutes: number = 60) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new AppError('Co-working space not found', 404);
    }

    const baseDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const operatingStartHour = 8;  // 08:00 AM
    const operatingEndHour = 20;  // 08:00 PM

    const dayStart = new Date(baseDate.setHours(operatingStartHour, 0, 0, 0));
    const dayEnd = new Date(baseDate.setHours(operatingEndHour, 0, 0, 0));

    const bookings = await prisma.booking.findMany({
      where: {
        spaceId,
        status: { in: ['APPROVED', 'PENDING'] },
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    });

    const maintenances = await prisma.maintenance.findMany({
      where: {
        spaceId,
        startTime: { lte: dayEnd },
        endTime: { gte: dayStart },
      },
    });

    const slots: Array<{ slot: string; startTime: string; endTime: string; isAvailable: boolean }> = [];
    let currentSlotStart = new Date(dayStart);

    while (currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000 <= dayEnd.getTime()) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000);

      const hasBookingConflict = bookings.some(
        (b) => b.startTime < currentSlotEnd && b.endTime > currentSlotStart
      );

      const hasMaintenanceConflict = maintenances.some(
        (m) => m.startTime < currentSlotEnd && m.endTime > currentSlotStart
      );

      const isAvailable = !hasBookingConflict && !hasMaintenanceConflict;

      const formatTime = (d: Date) => d.toTimeString().substring(0, 5);

      slots.push({
        slot: `${formatTime(currentSlotStart)} - ${formatTime(currentSlotEnd)}`,
        startTime: currentSlotStart.toISOString(),
        endTime: currentSlotEnd.toISOString(),
        isAvailable,
      });

      currentSlotStart = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000);
    }

    return {
      spaceId,
      spaceName: space.name,
      date: dayStart.toISOString().split('T')[0],
      totalSlots: slots.length,
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      slots,
    };
  }

  // 14. View Availability Calendar
  static async getCalendar(spaceId?: string, startDateStr?: string, endDateStr?: string) {
    const where: any = {};
    if (spaceId) where.spaceId = spaceId;

    const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr ? new Date(endDateStr) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: {
        ...where,
        status: { in: ['APPROVED', 'PENDING'] },
        startTime: { lte: endDate },
        endTime: { gte: startDate },
      },
      select: {
        id: true,
        spaceId: true,
        startTime: true,
        endTime: true,
        status: true,
        space: { select: { name: true } },
      },
    });

    const maintenances = await prisma.maintenance.findMany({
      where: {
        ...where,
        startTime: { lte: endDate },
        endTime: { gte: startDate },
      },
      select: {
        id: true,
        spaceId: true,
        startTime: true,
        endTime: true,
        reason: true,
        space: { select: { name: true } },
      },
    });

    return {
      range: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      events: [
        ...bookings.map((b) => ({
          id: b.id,
          type: 'BOOKING',
          title: `Booking (${b.status}) - ${b.space.name}`,
          spaceId: b.spaceId,
          start: b.startTime,
          end: b.endTime,
          status: b.status,
        })),
        ...maintenances.map((m) => ({
          id: m.id,
          type: 'MAINTENANCE',
          title: `Maintenance: ${m.reason || 'Scheduled Maintenance'}`,
          spaceId: m.spaceId,
          start: m.startTime,
          end: m.endTime,
        })),
      ],
    };
  }
}
