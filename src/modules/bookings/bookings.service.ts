import { Prisma } from '@prisma/client';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { BookingStatus } from '@prisma/client';

// Helper: compute booking amount from price and duration
function computeAmount(startTime: Date, endTime: Date, pricePerHour: number): number {
  const hours =
    Math.abs(new Date(endTime).getTime() - new Date(startTime).getTime()) / 36e5;
  return Math.round(hours * pricePerHour * 100) / 100;
}

// Helper: format a booking with enriched fields
function formatBooking(booking: {
  id: string;
  userId: string;
  spaceId: string;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  space?: { id: string; name: string; pricePerHour: number; type?: string | null } | null;
  user?: { id: string; name: string; email: string; phone?: string | null } | null;
}) {
  const pricePerHour = booking.space?.pricePerHour ?? 0;
  return {
    ...booking,
    date: booking.startTime.toISOString().split('T')[0],
    startTime: booking.startTime.toISOString().substring(11, 16),
    endTime: booking.endTime.toISOString().substring(11, 16),
    startDateTime: booking.startTime,
    endDateTime: booking.endTime,
    amount: computeAmount(booking.startTime, booking.endTime, pricePerHour),
  };
}

export class BookingsService {
  // 15. Create Booking — accepts {date, startTime, endTime} OR full ISO DateTimes
  static async createBooking(
    userId: string,
    spaceId: string,
    startTimeInput: string | Date,
    endTimeInput: string | Date,
    notes?: string,
    date?: string
  ) {
    let startTime: Date;
    let endTime: Date;

    // Support {date, startTime: "HH:MM", endTime: "HH:MM"} format
    if (date && typeof startTimeInput === 'string' && !startTimeInput.includes('T')) {
      startTime = new Date(`${date}T${startTimeInput}:00.000Z`);
      endTime = new Date(`${date}T${endTimeInput}:00.000Z`);
    } else {
      startTime = new Date(startTimeInput);
      endTime = new Date(endTimeInput);
    }

    if (startTime >= endTime) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    if (startTime < new Date()) {
      throw new AppError('Cannot create a booking in the past', 400);
    }

    const check = await AvailabilityService.checkAvailability(spaceId, startTime, endTime);
    if (!check.isAvailable) {
      throw new AppError('The requested space is unavailable during this selected time slot', 400);
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        spaceId,
        startTime,
        endTime,
        status: 'PENDING',
        notes: notes ?? null,
      },
      include: {
        space: { select: { id: true, name: true, type: true, pricePerHour: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return formatBooking(booking);
  }

  // 16. View Own Member Bookings
  static async getUserBookings(
    userId: string,
    filters: {
      status?: BookingStatus;
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = { userId };
    if (filters.status) where.status = filters.status;

    if (filters.date) {
      const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
      const dayEnd = new Date(`${filters.date}T23:59:59.999Z`);
      where.startTime = { gte: dayStart, lte: dayEnd };
    } else if (filters.startDate || filters.endDate) {
      where.startTime = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const allowedSort = ['createdAt', 'startTime', 'status'];
    const sortBy = allowedSort.includes(filters.sortBy ?? '') ? filters.sortBy! : 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          space: { select: { id: true, name: true, type: true, pricePerHour: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings.map(formatBooking),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 17. View Booking Details (Member or Admin)
  static async getBookingById(id: string, userId?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        space: { select: { id: true, name: true, type: true, pricePerHour: true, location: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (userId && booking.userId !== userId) {
      throw new AppError('Forbidden: Access denied to this booking record', 403);
    }

    return formatBooking(booking);
  }

  // 18. Update Own Booking
  static async updateBooking(
    id: string,
    userId: string,
    data: { startTime?: Date; endTime?: Date; notes?: string }
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: { select: { id: true, name: true, type: true, pricePerHour: true } } },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== userId) throw new AppError('Forbidden: Access denied to this booking record', 403);
    if (booking.status !== 'PENDING') {
      throw new AppError('Only PENDING bookings can be modified by members', 400);
    }

    const startTime = data.startTime ? new Date(data.startTime) : booking.startTime;
    const endTime = data.endTime ? new Date(data.endTime) : booking.endTime;

    if (startTime >= endTime) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    const check = await AvailabilityService.checkAvailability(booking.spaceId, startTime, endTime);
    if (!check.isAvailable) {
      const overlapping = await prisma.booking.findMany({
        where: {
          id: { not: id },
          spaceId: booking.spaceId,
          status: { in: ['APPROVED', 'PENDING'] },
          OR: [
            { startTime: { lte: startTime }, endTime: { gt: startTime } },
            { startTime: { lt: endTime }, endTime: { gte: endTime } },
            { startTime: { gte: startTime }, endTime: { lte: endTime } },
          ],
        },
      });
      if (overlapping.length > 0) {
        throw new AppError('The requested new time slot is unavailable due to an existing booking', 400);
      }
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        startTime,
        endTime,
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
      include: { space: { select: { id: true, name: true, type: true, pricePerHour: true } } },
    });

    return formatBooking(updated);
  }

  // 19. Cancel Own Booking
  static async cancelBooking(id: string, userId: string, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: { select: { id: true, name: true, type: true, pricePerHour: true } } },
    });

    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.userId !== userId) throw new AppError('Forbidden: Access denied to this booking record', 403);
    if (booking.status === 'CANCELLED') throw new AppError('Booking is already cancelled', 400);
    if (booking.status === 'REJECTED') throw new AppError('Cannot cancel a booking that was rejected', 400);

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { space: { select: { id: true, name: true, type: true, pricePerHour: true } } },
    });

    return { ...formatBooking(updated), cancellationReason: reason ?? null };
  }

  // 25. View All Bookings (Admin)
  static async getAllBookingsAdmin(
    filters: {
      status?: BookingStatus;
      spaceId?: string;
      userId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BookingWhereInput = {};
    if (filters.status) where.status = filters.status;
    if (filters.spaceId) where.spaceId = filters.spaceId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.date) {
      const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
      const dayEnd = new Date(`${filters.date}T23:59:59.999Z`);
      where.startTime = { gte: dayStart, lte: dayEnd };
    } else if (filters.startDate || filters.endDate) {
      where.startTime = {
        ...(filters.startDate ? { gte: new Date(filters.startDate) } : {}),
        ...(filters.endDate ? { lte: new Date(filters.endDate) } : {}),
      };
    }

    const allowedSort = ['createdAt', 'startTime', 'status'];
    const sortBy = allowedSort.includes(filters.sortBy ?? '') ? filters.sortBy! : 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          space: { select: { id: true, name: true, type: true, pricePerHour: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      data: bookings.map(formatBooking),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // 27. Approve Booking & Auto-Reject Overlapping Pending Bookings (Admin)
  static async approveBookingAdmin(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.status === 'APPROVED') throw new AppError('Booking is already approved', 400);

    const approvedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        space: { select: { id: true, name: true, type: true, pricePerHour: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await prisma.booking.updateMany({
      where: {
        id: { not: id },
        spaceId: booking.spaceId,
        status: 'PENDING',
        OR: [
          { startTime: { lte: booking.startTime }, endTime: { gt: booking.startTime } },
          { startTime: { lt: booking.endTime }, endTime: { gte: booking.endTime } },
          { startTime: { gte: booking.startTime }, endTime: { lte: booking.endTime } },
        ],
      },
      data: { status: 'REJECTED' },
    });

    return formatBooking(approvedBooking);
  }

  // 28. Reject Pending Booking (Admin)
  static async rejectBookingAdmin(id: string, reason?: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new AppError('Booking not found', 404);

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        space: { select: { id: true, name: true, type: true, pricePerHour: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return { ...formatBooking(updated), rejectionReason: reason ?? null };
  }
}
