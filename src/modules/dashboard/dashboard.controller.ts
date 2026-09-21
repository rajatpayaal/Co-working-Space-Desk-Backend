import { Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 47. GET /api/admin/dashboard/stats
export const getDashboardStats = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await DashboardService.getStats();
    return sendResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
  }
);

// 48. GET /api/admin/dashboard/bookings
export const getDashboardBookings = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const bookings = await DashboardService.getDashboardBookings();
    return sendResponse(res, 200, 'Dashboard bookings summary retrieved successfully', bookings);
  }
);

// 49. GET /api/admin/dashboard/revenue
export const getRevenueStats = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const revenue = await DashboardService.getRevenueStats();
    return sendResponse(res, 200, 'Dashboard revenue statistics retrieved successfully', revenue);
  }
);

// 50. GET /api/admin/dashboard/activity
export const getActivityFeed = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const activity = await DashboardService.getActivityFeed();
    return sendResponse(res, 200, 'Dashboard activity feed retrieved successfully', activity);
  }
);

// 51. GET /api/admin/dashboard/booking-trends
export const getBookingTrends = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const trends = await DashboardService.getBookingTrends();
    return sendResponse(res, 200, 'Booking trends analytics retrieved successfully', trends);
  }
);
