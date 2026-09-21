import { Response } from 'express';
import { BookingsService } from './bookings.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const createBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { spaceId, startTime, endTime } = req.body;
  const booking = await BookingsService.createBooking(
    req.user!.id,
    spaceId,
    new Date(startTime),
    new Date(endTime)
  );
  return sendResponse(res, 201, 'Booking created successfully', booking);
});

export const getMyBookings = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const bookings = await BookingsService.getUserBookings(req.user!.id);
  return sendResponse(res, 200, 'User bookings retrieved successfully', bookings);
});

export const getBookingDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const booking = await BookingsService.getBookingById(id, req.user!.id);
  return sendResponse(res, 200, 'Booking details retrieved successfully', booking);
});

export const cancelBooking = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const booking = await BookingsService.cancelBooking(id, req.user!.id);
  return sendResponse(res, 200, 'Booking cancelled successfully', booking);
});

export const getAllBookingsAdmin = asyncHandler(
  async (_req: AuthenticatedRequest, res: Response) => {
    const bookings = await BookingsService.getAllBookingsAdmin();
    return sendResponse(res, 200, 'All bookings retrieved successfully', bookings);
  }
);

export const approveBookingAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const booking = await BookingsService.updateBookingStatusAdmin(id, 'APPROVED');
    return sendResponse(res, 200, 'Booking approved successfully', booking);
  }
);

export const rejectBookingAdmin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const id = req.params.id as string;
    const booking = await BookingsService.updateBookingStatusAdmin(id, 'REJECTED');
    return sendResponse(res, 200, 'Booking rejected successfully', booking);
  }
);
