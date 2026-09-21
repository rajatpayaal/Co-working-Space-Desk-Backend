import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { AvailabilityService } from '../availability/availability.service.js';

export class BookingsService {
  static async createBooking(userId: string, spaceId: string, startTime: Date, endTime: Date) {
    if (new Date(startTime) >= new Date(endTime)) {
      throw new AppError('Start time must be before end time', 400);
    }

    const check = await AvailabilityService.checkAvailability(spaceId, startTime, endTime);
    if (!check.isAvailable) {
      throw new AppError('The requested space is not available during this time slot', 400);
    }

    return prisma.booking.create({
      data: {
        userId,
        spaceId,
        startTime,
        endTime,
        status: 'PENDING',
      },
      include: { space: true },
    });
  }

  static async getUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getBookingById(id: string, userId?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { space: true, user: { select: { id: true, name: true, email: true } } },
    });

    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    if (userId && booking.userId !== userId) {
      throw new AppError('Forbidden: Access denied to this booking', 403);
    }

    return booking;
  }

  static async cancelBooking(id: string, userId: string) {
    const booking = await this.getBookingById(id, userId);

    if (booking.status === 'CANCELLED') {
      throw new AppError('Booking is already cancelled', 400);
    }

    return prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  static async getAllBookingsAdmin() {
    return prisma.booking.findMany({
      include: { space: true, user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateBookingStatusAdmin(id: string, status: 'APPROVED' | 'REJECTED') {
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new AppError('Booking not found', 404);
    }

    return prisma.booking.update({
      where: { id },
      data: { status },
    });
  }
}
