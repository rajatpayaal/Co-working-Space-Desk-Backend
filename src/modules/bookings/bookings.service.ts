import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { BookingStatus } from '@prisma/client';

export class BookingsService {
  // 15. Create Booking
  static async createBooking(userId: string, spaceId: string, startTime: Date, endTime: Date) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('Start time must be strictly before end time', 400);
    }

    if (new Date(startTime) < new Date()) {
      throw new AppError('Cannot create a booking in the past', 400);
    }

    const check = await AvailabilityService.checkAvailability(spaceId, startTime, endTime);
    if (!check.isAvailable) {
      throw new AppError('The requested space is unavailable during this selected time slot', 400);
    }

    return prisma.booking.create({
      data: {
        userId,
        spaceId,
        startTime,
        endTime,
        status: 'PENDING',
      },
      include: {
        space: {
          select: { id: true, name: true, capacity: true, pricePerHour: true },
        },
      },
    });
  }

  // 16. View Own Member Bookings
  static async getUserBookings(
    userId: string,
    filters: { status?: BookingStatus; page?: number; limit?: number } = {}
  ) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (filters.status) {
      where.status = filters.status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          space: {
            select: { id: true, name: true, capacity: true, pricePerHour: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 17. View Booking Details (Member or Admin)
  static async getBookingById(id: string, userId?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        space: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (userId && booking.userId !== userId) {
      throw new AppError('Forbidden: Access denied to this booking record', 403);
    }

    return booking;
  }

  // 18. Update Own Booking
  static async updateBooking(
    id: string,
    userId: string,
    data: { startTime?: Date; endTime?: Date }
  ) {
    const booking = await this.getBookingById(id, userId);

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
      const overlappingOtherBookings = await prisma.booking.findMany({
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

      if (overlappingOtherBookings.length > 0) {
        throw new AppError('The requested new time slot is unavailable due to an existing booking', 400);
      }
    }

    return prisma.booking.update({
      where: { id },
      data: { startTime, endTime },
      include: { space: true },
    });
  }

  // 19. Cancel Own Booking
  static async cancelBooking(id: string, userId: string) {
    const booking = await this.getBookingById(id, userId);

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400);
    }

    if (booking.status === 'REJECTED') {
      throw new AppError('Cannot cancel a booking that was rejected', 400);
    }

    return prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: { space: true },
    });
  }

  // 25. View All Bookings (Admin)
  static async getAllBookingsAdmin(filters: {
    status?: BookingStatus;
    spaceId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.spaceId) where.spaceId = filters.spaceId;
    if (filters.userId) where.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) where.startTime.gte = new Date(filters.startDate);
      if (filters.endDate) where.startTime.lte = new Date(filters.endDate);
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          space: { select: { id: true, name: true, pricePerHour: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 27. Approve Booking & Auto-Reject Overlapping Pending Bookings (Admin)
  static async approveBookingAdmin(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (booking.status === 'APPROVED') {
      throw new AppError('Booking is already approved', 400);
    }

    // Approve target booking
    const approvedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'APPROVED' },
      include: {
        space: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Auto-reject any overlapping pending bookings for the same space
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

    return approvedBooking;
  }

  // 28. Reject Pending Booking (Admin)
  static async rejectBookingAdmin(id: string) {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return prisma.booking.update({
      where: { id },
      data: { status: 'REJECTED' },
      include: {
        space: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
