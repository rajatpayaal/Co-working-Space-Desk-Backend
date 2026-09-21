import { Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';
import { BookingStatus } from '@prisma/client';

// Member Controllers
export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { spaceId, startTime, endTime } = req.body;
  const booking = await BookingsService.createBooking(
    req.user!.id,
    spaceId,
    new Date(startTime),
    new Date(endTime)
  );
  return sendResponse(res, 201, 'Desk booking created successfully', booking);
});

export const getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const status = req.query.status as BookingStatus | undefined;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const result = await BookingsService.getUserBookings(req.user!.id, { status, page, limit });
  return sendResponse(res, 200, 'Member bookings retrieved successfully', result);
});

export const getBookingDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const booking = await BookingsService.getBookingById(id, req.user!.id);
  return sendResponse(res, 200, 'Booking details retrieved successfully', booking);
});

export const updateBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { startTime, endTime } = req.body;

  const updatedBooking = await BookingsService.updateBooking(id, req.user!.id, {
    startTime: startTime ? new Date(startTime) : undefined,
    endTime: endTime ? new Date(endTime) : undefined,
  });

  return sendResponse(res, 200, 'Booking updated successfully', updatedBooking);
});

export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const booking = await BookingsService.cancelBooking(id, req.user!.id);
  return sendResponse(res, 200, 'Booking cancelled successfully', booking);
});

// 25. GET /api/admin/bookings
export const getAllBookingsAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await BookingsService.getAllBookingsAdmin({
      status: req.query.status as BookingStatus | undefined,
      spaceId: req.query.spaceId as string | undefined,
      userId: req.query.userId as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
    });
    return sendResponse(res, 200, 'Admin bookings list retrieved successfully', result);
  }
);

// 26. GET /api/admin/bookings/:id
export const getAdminBookingDetails = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const booking = await BookingsService.getBookingById(id);
    return sendResponse(res, 200, 'Admin booking details retrieved successfully', booking);
  }
);

// 27. PATCH /api/admin/bookings/:id/approve
export const approveBookingAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const booking = await BookingsService.approveBookingAdmin(id);
    return sendResponse(
      res,
      200,
      'Booking approved successfully and overlapping pending bookings auto-rejected',
      booking
    );
  }
);

// 28. PATCH /api/admin/bookings/:id/reject
export const rejectBookingAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const booking = await BookingsService.rejectBookingAdmin(id);
    return sendResponse(res, 200, 'Booking rejected successfully', booking);
  }
);
