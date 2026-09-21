import { Response } from 'express';
import { DashboardService } from './dashboard.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getDashboardStats = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await DashboardService.getStats();
    return sendResponse(res, 200, 'Dashboard stats retrieved successfully', stats);
  }
);

export const getBookingTrends = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const trends = await DashboardService.getBookingTrends();
    return sendResponse(res, 200, 'Booking trends retrieved successfully', trends);
  }
);
