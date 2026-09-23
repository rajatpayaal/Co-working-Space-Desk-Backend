import { Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// GET /api/admin/dashboard/stats
export const getDashboardStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const stats = await DashboardService.getStats();
  return sendResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
});

// GET /api/admin/dashboard/bookings?date&status&limit
export const getDashboardBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const bookings = await DashboardService.getDashboardBookings({
    date: req.query.date as string | undefined,
    status: req.query.status as string | undefined,
    limit: req.query.limit ? Number(req.query.limit) : 10,
  });
  return sendResponse(res, 200, 'Dashboard bookings summary retrieved successfully', bookings);
});

// GET /api/admin/dashboard/revenue?startDate&endDate&groupBy
export const getRevenueStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const revenue = await DashboardService.getRevenueStats({
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    groupBy: req.query.groupBy as string | undefined,
  });
  return sendResponse(res, 200, 'Dashboard revenue statistics retrieved successfully', revenue);
});

// GET /api/admin/dashboard/activity?limit&page
export const getActivityFeed = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const activity = await DashboardService.getActivityFeed({
    limit: req.query.limit ? Number(req.query.limit) : 10,
    page: req.query.page ? Number(req.query.page) : 1,
  });
  return sendResponse(res, 200, 'Dashboard activity feed retrieved successfully', activity);
});

// GET /api/admin/dashboard/booking-trends?startDate&endDate&groupBy
export const getBookingTrends = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const trends = await DashboardService.getBookingTrends({
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
    groupBy: req.query.groupBy as string | undefined,
  });
  return sendResponse(res, 200, 'Booking trends analytics retrieved successfully', trends);
});
