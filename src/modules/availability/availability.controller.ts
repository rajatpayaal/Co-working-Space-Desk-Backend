import { Request, Response } from 'express';
import { AvailabilityService } from './availability.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';

// 11. POST /api/availability/check
// Accepts: {spaceId, date, startTime, endTime} OR {spaceId, startTime (ISO), endTime (ISO)}
export const checkSpaceAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId, date, startTime, endTime } = req.body;

  let result;
  if (date && startTime && endTime && !startTime.includes('T')) {
    // New spec format: {date: "YYYY-MM-DD", startTime: "HH:MM", endTime: "HH:MM"}
    result = await AvailabilityService.checkAvailability(spaceId, date, startTime, endTime);
  } else {
    // Legacy ISO format: {startTime: "2026-...", endTime: "2026-..."}
    result = await AvailabilityService.checkAvailability(
      spaceId,
      new Date(startTime),
      new Date(endTime)
    );
  }

  return sendResponse(res, 200, 'Space availability checked successfully', result);
});

// 12. GET /api/spaces/:id/availability (also served via spaces router)
export const getSpaceAvailabilityDetail = asyncHandler(async (req: Request, res: Response) => {
  const spaceId = req.params.id as string;
  const date = req.query.date as string;
  const availability = await AvailabilityService.getSpaceAvailability(spaceId, date);
  return sendResponse(res, 200, 'Space availability details retrieved successfully', availability);
});

// 13. GET /api/spaces/:id/slots
export const getAvailableTimeSlots = asyncHandler(async (req: Request, res: Response) => {
  const spaceId = req.params.id as string;
  const date = req.query.date as string;
  const durationMinutes = req.query.durationMinutes ? Number(req.query.durationMinutes) : 60;
  const slots = await AvailabilityService.getAvailableTimeSlots(spaceId, date, durationMinutes);
  return sendResponse(res, 200, 'Available time slots retrieved successfully', slots);
});

// 14. GET /api/availability/calendar
export const getAvailabilityCalendar = asyncHandler(async (req: Request, res: Response) => {
  const spaceId = req.query.spaceId as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  const calendar = await AvailabilityService.getCalendar(spaceId, startDate, endDate);
  return sendResponse(res, 200, 'Availability calendar fetched successfully', calendar);
});
