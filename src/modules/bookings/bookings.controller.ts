import { Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';
import { BookingStatus } from '@prisma/client';

const qs = (v: unknown): string | undefined => (v ? String(v) : undefined);

// POST /api/bookings
export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { spaceId, date, startTime, endTime, notes } = req.body;
  const booking = await BookingsService.createBooking(
    req.user!.id,
    spaceId,
    startTime,
    endTime,
    notes,
    date
  );
  return sendResponse(res, 201, 'Desk booking created successfully', booking);
});

// GET /api/bookings
export const getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingsService.getUserBookings(req.user!.id, {
    status: qs(req.query.status) as BookingStatus | undefined,
    date: qs(req.query.date),
    startDate: qs(req.query.startDate),
    endDate: qs(req.query.endDate),
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: qs(req.query.sortBy),
    sortOrder: qs(req.query.sortOrder) as 'asc' | 'desc' | undefined,
  });
  return sendResponse(res, 200, 'Member bookings retrieved successfully', result);
});

// GET /api/bookings/:id
export const getBookingDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await BookingsService.getBookingById(String(req.params.id), req.user!.id);
  return sendResponse(res, 200, 'Booking details retrieved successfully', booking);
});

// PATCH /api/bookings/:id
export const updateBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { startTime, endTime, notes } = req.body;
  const updated = await BookingsService.updateBooking(String(req.params.id), req.user!.id, {
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
    notes,
  });
  return sendResponse(res, 200, 'Booking updated successfully', updated);
});

// POST /api/bookings/:id/cancel
export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reason = req.body?.reason as string | undefined;
  const booking = await BookingsService.cancelBooking(String(req.params.id), req.user!.id, reason);
  return sendResponse(res, 200, 'Booking cancelled successfully', booking);
});

// GET /api/admin/bookings
export const getAllBookingsAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await BookingsService.getAllBookingsAdmin({
    status: qs(req.query.status) as BookingStatus | undefined,
    spaceId: qs(req.query.spaceId),
    userId: qs(req.query.userId),
    date: qs(req.query.date),
    startDate: qs(req.query.startDate),
    endDate: qs(req.query.endDate),
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: qs(req.query.sortBy),
    sortOrder: qs(req.query.sortOrder) as 'asc' | 'desc' | undefined,
  });
  return sendResponse(res, 200, 'Admin bookings list retrieved successfully', result);
});

// GET /api/admin/bookings/:id
export const getAdminBookingDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await BookingsService.getBookingById(String(req.params.id));
  return sendResponse(res, 200, 'Admin booking details retrieved successfully', booking);
});

// PATCH /api/admin/bookings/:id/approve
export const approveBookingAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const booking = await BookingsService.approveBookingAdmin(String(req.params.id));
  return sendResponse(res, 200, 'Booking approved successfully and overlapping pending bookings auto-rejected', booking);
});

// PATCH /api/admin/bookings/:id/reject
export const rejectBookingAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const reason = req.body?.reason as string | undefined;
  const booking = await BookingsService.rejectBookingAdmin(String(req.params.id), reason);
  return sendResponse(res, 200, 'Booking rejected successfully', booking);
});

