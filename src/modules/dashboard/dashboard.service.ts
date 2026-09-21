import { prisma } from '../../config/prisma.js';

export class DashboardService {
  static async getStats() {
    const totalUsers = await prisma.user.count();
    const totalSpaces = await prisma.space.count();
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const approvedBookings = await prisma.booking.count({ where: { status: 'APPROVED' } });

    return {
      totalUsers,
      totalSpaces,
      totalBookings,
      pendingBookings,
      approvedBookings,
    };
  }

  static async getBookingTrends() {
    const bookings = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return bookings;
  }
}
