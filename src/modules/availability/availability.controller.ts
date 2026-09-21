import { Request, Response } from 'express';
import { AvailabilityService } from './availability.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';

export const checkSpaceAvailability = asyncHandler(async (req: Request, res: Response) => {
  const { spaceId, startTime, endTime } = req.body;
  const result = await AvailabilityService.checkAvailability(
    spaceId,
    new Date(startTime),
    new Date(endTime)
  );
  return sendResponse(res, 200, 'Space availability checked', result);
});

export const getAvailabilityCalendar = asyncHandler(async (req: Request, res: Response) => {
  const spaceId = req.query.spaceId as string;
  const calendar = await AvailabilityService.getCalendar(spaceId);
  return sendResponse(res, 200, 'Availability calendar fetched successfully', calendar);
});
