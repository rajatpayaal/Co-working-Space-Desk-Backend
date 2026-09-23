import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';

// Helper: convert "HH:MM" time string + "YYYY-MM-DD" date string to a full Date
function combineDateAndTime(dateStr: string, timeStr: string): Date {
  const dt = new Date(`${dateStr}T${timeStr}:00.000Z`);
  if (isNaN(dt.getTime())) {
    throw new AppError(`Invalid date/time combination: ${dateStr} ${timeStr}`, 400);
  }
  return dt;
}

// Helper: format a Date to "HH:MM"
function toHHMM(d: Date): string {
  return d.toISOString().substring(11, 16);
}

export class AvailabilityService {
  // 11. Check Space Availability — accepts full DateTime OR {date, startTime, endTime} strings
  static async checkAvailability(
    spaceId: string,
    startTimeOrDate: Date | string,
    endTimeOrTime: Date | string,
    endTimeParam?: string
  ) {
    let startTime: Date;
    let endTime: Date;

    // Support {date, startTime, endTime} string format from POST /availability/check
    if (typeof startTimeOrDate === 'string' && typeof endTimeOrTime === 'string' && endTimeParam) {
      // Called as checkAvailabilityFromStrings(spaceId, date, startTime, endTime)
      startTime = combineDateAndTime(startTimeOrDate, endTimeOrTime);
      endTime = combineDateAndTime(startTimeOrDate, endTimeParam);
    } else if (startTimeOrDate instanceof Date && endTimeOrTime instanceof Date) {
      startTime = startTimeOrDate;
      endTime = endTimeOrTime;
    } else {
      // Fallback: parse as ISO strings
      startTime = new Date(startTimeOrDate as string);
      endTime = new Date(endTimeOrTime as string);
    }

    if (startTime >= endTime) {
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
    const date = startTime.toISOString().split('T')[0];

    return {
      spaceId,
      spaceName: space.name,
      date,
      startTime: toHHMM(startTime),
      endTime: toHHMM(endTime),
      available: isAvailable,
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
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

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

    const available = bookings.length === 0 && maintenances.length === 0;
    const dateStr = startOfDay.toISOString().split('T')[0];

    return {
      spaceId,
      date: dateStr,
      available,
      bookedSlots: bookings.map((b) => ({
        id: b.id,
        startTime: toHHMM(b.startTime),
        endTime: toHHMM(b.endTime),
        status: b.status,
      })),
      blockedSlots: maintenances.map((m) => ({
        id: m.id,
        startTime: toHHMM(m.startTime),
        endTime: toHHMM(m.endTime),
        reason: m.reason ?? null,
      })),
    };
  }

  // 13. View Available Time Slots
  static async getAvailableTimeSlots(
    spaceId: string,
    targetDateStr?: string,
    slotDurationMinutes: number = 60
  ) {
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new AppError('Co-working space not found', 404);
    }

    const baseDate = targetDateStr ? new Date(targetDateStr) : new Date();
    const operatingStartHour = 8; // 08:00 AM
    const operatingEndHour = 20;  // 08:00 PM

    const dayStart = new Date(baseDate);
    dayStart.setHours(operatingStartHour, 0, 0, 0);
    const dayEnd = new Date(baseDate);
    dayEnd.setHours(operatingEndHour, 0, 0, 0);

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

    const slots: Array<{ startTime: string; endTime: string; available: boolean }> = [];
    let currentSlotStart = new Date(dayStart);

    while (currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000 <= dayEnd.getTime()) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000);

      const hasBookingConflict = bookings.some(
        (b) => b.startTime < currentSlotEnd && b.endTime > currentSlotStart
      );
      const hasMaintenanceConflict = maintenances.some(
        (m) => m.startTime < currentSlotEnd && m.endTime > currentSlotStart
      );
      const available = !hasBookingConflict && !hasMaintenanceConflict;

      slots.push({
        startTime: toHHMM(currentSlotStart),
        endTime: toHHMM(currentSlotEnd),
        available,
      });

      currentSlotStart = new Date(currentSlotStart.getTime() + slotDurationMinutes * 60 * 1000);
    }

    return {
      spaceId,
      date: dayStart.toISOString().split('T')[0],
      slots,
    };
  }

  // 14. View Availability Calendar
  static async getCalendar(spaceId?: string, startDateStr?: string, endDateStr?: string) {
    const startDate = startDateStr
      ? new Date(startDateStr)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = endDateStr
      ? new Date(endDateStr)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const bookingWhere: Prisma.BookingWhereInput = {
      status: { in: ['APPROVED', 'PENDING'] },
      startTime: { lte: endDate },
      endTime: { gte: startDate },
      ...(spaceId ? { spaceId } : {}),
    };

    const maintenanceWhere: Prisma.MaintenanceWhereInput = {
      startTime: { lte: endDate },
      endTime: { gte: startDate },
      ...(spaceId ? { spaceId } : {}),
    };

    const bookings = await prisma.booking.findMany({
      where: bookingWhere,
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
      where: maintenanceWhere,
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
