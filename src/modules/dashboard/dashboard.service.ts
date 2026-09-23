import { prisma } from '../../config/prisma.js';

// Helper: compute booking amount
function computeAmount(startTime: Date, endTime: Date, pricePerHour: number): number {
  const hours = Math.abs(endTime.getTime() - startTime.getTime()) / 36e5;
  return Math.round(hours * pricePerHour * 100) / 100;
}

export class DashboardService {
  // GET /api/admin/dashboard/stats
  static async getStats() {
    const [
      totalUsers,
      totalSpaces,
      activeSpaces,
      totalBookings,
      pendingBookings,
      approvedBookings,
      cancelledBookings,
      rejectedBookings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.space.count(),
      prisma.space.count({ where: { isActive: true } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.count({ where: { status: 'APPROVED' } }),
      prisma.booking.count({ where: { status: 'CANCELLED' } }),
      prisma.booking.count({ where: { status: 'REJECTED' } }),
    ]);

    // Compute totalRevenue from approved bookings
    const approvedBookingsList = await prisma.booking.findMany({
      where: { status: 'APPROVED' },
      include: { space: { select: { pricePerHour: true } } },
    });
    const totalRevenue = approvedBookingsList.reduce((sum, b) => {
      return sum + computeAmount(b.startTime, b.endTime, b.space.pricePerHour);
    }, 0);

    return {
      totalUsers,
      totalSpaces,
      activeSpaces,
      totalBookings,
      pendingBookings,
      approvedBookings,
      cancelledBookings,
      rejectedBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
    };
  }

  // GET /api/admin/dashboard/bookings?date&status&limit
  static async getDashboardBookings(filters: { date?: string; status?: string; limit?: number } = {}) {
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.date) {
      const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
      const dayEnd = new Date(`${filters.date}T23:59:59.999Z`);
      where.startTime = { gte: dayStart, lte: dayEnd };
    }

    const bookings = await prisma.booking.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        space: { select: { id: true, name: true, pricePerHour: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      data: bookings.map((b) => ({
        id: b.id,
        user: b.user,
        space: b.space,
        date: b.startTime.toISOString().split('T')[0],
        startTime: b.startTime.toISOString().substring(11, 16),
        endTime: b.endTime.toISOString().substring(11, 16),
        status: b.status,
        amount: computeAmount(b.startTime, b.endTime, b.space.pricePerHour),
      })),
    };
  }

  // GET /api/admin/dashboard/revenue?startDate&endDate&groupBy
  static async getRevenueStats(filters: { startDate?: string; endDate?: string; groupBy?: string } = {}) {
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const groupBy = filters.groupBy || 'day';

    const approvedBookings = await prisma.booking.findMany({
      where: {
        status: 'APPROVED',
        startTime: { gte: startDate, lte: endDate },
      },
      include: { space: { select: { pricePerHour: true } } },
      orderBy: { startTime: 'asc' },
    });

    // Group revenue by day/week/month
    const revenueMap = new Map<string, number>();
    for (const b of approvedBookings) {
      const amount = computeAmount(b.startTime, b.endTime, b.space.pricePerHour);
      let key: string;
      const d = b.startTime;
      if (groupBy === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = d.toISOString().split('T')[0];
      }
      revenueMap.set(key, (revenueMap.get(key) ?? 0) + amount);
    }

    const data = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
    }));

    return { data };
  }

  // GET /api/admin/dashboard/activity?limit&page
  static async getActivityFeed(filters: { limit?: number; page?: number } = {}) {
    const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const skip = (page - 1) * limit;

    const recentBookings = await prisma.booking.findMany({
      take: limit,
      skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        space: { select: { name: true } },
      },
    });

    const activities = recentBookings.map((b) => ({
      id: b.id,
      type: 'BOOKING',
      message: `${b.user.name} ${b.status.toLowerCase()} a booking for ${b.space.name}`,
      user: b.user,
      createdAt: b.createdAt,
    }));

    return { data: activities };
  }

  // GET /api/admin/dashboard/booking-trends?startDate&endDate&groupBy
  static async getBookingTrends(filters: { startDate?: string; endDate?: string; groupBy?: string } = {}) {
    const startDate = filters.startDate ? new Date(filters.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const groupBy = filters.groupBy || 'day';

    const bookings = await prisma.booking.findMany({
      where: { startTime: { gte: startDate, lte: endDate } },
      select: { startTime: true, status: true },
      orderBy: { startTime: 'asc' },
    });

    const trendsMap = new Map<string, { total: number; pending: number; approved: number; rejected: number; cancelled: number }>();

    for (const b of bookings) {
      const d = b.startTime;
      let key: string;
      if (groupBy === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = d.toISOString().split('T')[0];
      }

      const entry = trendsMap.get(key) ?? { total: 0, pending: 0, approved: 0, rejected: 0, cancelled: 0 };
      entry.total += 1;
      if (b.status === 'PENDING') entry.pending += 1;
      if (b.status === 'APPROVED') entry.approved += 1;
      if (b.status === 'REJECTED') entry.rejected += 1;
      if (b.status === 'CANCELLED') entry.cancelled += 1;
      trendsMap.set(key, entry);
    }

    const data = Array.from(trendsMap.entries()).map(([date, counts]) => ({ date, ...counts }));
    return { data };
  }
}
