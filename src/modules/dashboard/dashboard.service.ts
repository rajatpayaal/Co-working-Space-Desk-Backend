import { prisma } from '../../config/prisma.js';

export class DashboardService {
  // 47. Dashboard Stats
  static async getStats() {
    const totalUsers = await prisma.user.count();
    const totalSpaces = await prisma.space.count();
    const totalBookings = await prisma.booking.count();
    const pendingBookings = await prisma.booking.count({ where: { status: 'PENDING' } });
    const approvedBookings = await prisma.booking.count({ where: { status: 'APPROVED' } });
    const totalMaintenance = await prisma.maintenance.count();

    return {
      totalUsers,
      totalSpaces,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalMaintenance,
    };
  }

  // 48. Dashboard Bookings Summary
  static async getDashboardBookings() {
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        space: { select: { id: true, name: true, pricePerHour: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return recentBookings;
  }

  // 49. Dashboard Revenue Statistics
  static async getRevenueStats() {
    const approvedBookings = await prisma.booking.findMany({
      where: { status: 'APPROVED' },
      include: { space: { select: { pricePerHour: true } } },
    });

    let totalEstimatedRevenue = 0;
    for (const booking of approvedBookings) {
      const hours =
        Math.abs(new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) /
        36e5;
      totalEstimatedRevenue += hours * (booking.space.pricePerHour || 0);
    }

    return {
      approvedBookingsCount: approvedBookings.length,
      totalEstimatedRevenue: Math.round(totalEstimatedRevenue * 100) / 100,
      currency: 'USD',
    };
  }

  // 50. Dashboard Activity Feed
  static async getActivityFeed() {
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } }, space: { select: { name: true } } },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return {
      recentBookings: recentBookings.map((b) => ({
        id: b.id,
        activity: `User ${b.user.name} booked ${b.space.name}`,
        status: b.status,
        timestamp: b.createdAt,
      })),
      recentUsers: recentUsers.map((u) => ({
        id: u.id,
        activity: `New user registered: ${u.name} (${u.email})`,
        timestamp: u.createdAt,
      })),
    };
  }

  // 51. Dashboard Booking Trends Analytics
  static async getBookingTrends() {
    const bookingsByStatus = await prisma.booking.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return bookingsByStatus;
  }
}
