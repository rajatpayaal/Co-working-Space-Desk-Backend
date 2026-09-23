import { Response } from 'express';
import { SpacesService } from './spaces.service.js';
import { AvailabilityService } from '../availability/availability.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

const qs = (v: unknown): string | undefined => (v ? String(v) : undefined);
const qn = (v: unknown): number | undefined => (v ? Number(v) : undefined);

// Public GET /api/spaces
export const getSpaces = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SpacesService.getAllSpaces({
    search: qs(req.query.search),
    type: qs(req.query.type),
    capacity: qn(req.query.capacity),
    minCapacity: qn(req.query.minCapacity),
    maxCapacity: qn(req.query.maxCapacity),
    minPrice: qn(req.query.minPrice),
    maxPrice: qn(req.query.maxPrice),
    date: qs(req.query.date),
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 12,
    sortBy: qs(req.query.sortBy),
    sortOrder: qs(req.query.sortOrder) as 'asc' | 'desc' | undefined,
    isActive: true,
  });
  return sendResponse(res, 200, 'Public spaces list retrieved successfully', result);
});

// Public GET /api/spaces/:id
export const getSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const space = await SpacesService.getSpaceById(String(req.params.id), false);
  return sendResponse(res, 200, 'Space details retrieved successfully', space);
});

// Public GET /api/spaces/:id/availability
export const getSpaceAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const date = qs(req.query.date);
  const startDate = qs(req.query.startDate);
  const endDate = qs(req.query.endDate);

  if (startDate || endDate) {
    const calendar = await AvailabilityService.getCalendar(id, startDate, endDate);
    return sendResponse(res, 200, 'Space availability calendar retrieved successfully', {
      spaceId: id,
      ...calendar,
    });
  }

  const result = await AvailabilityService.getSpaceAvailability(id, date);
  return sendResponse(res, 200, 'Space availability retrieved successfully', result);
});

// Public GET /api/spaces/:id/slots
export const getSpaceSlots = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const date = qs(req.query.date);
  const duration = req.query.duration ? Number(req.query.duration) : 60;
  const result = await AvailabilityService.getAvailableTimeSlots(id, date, duration);
  return sendResponse(res, 200, 'Available time slots retrieved successfully', result);
});

// Admin POST /api/admin/spaces
export const createSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const space = await SpacesService.createSpace(req.body);
  return sendResponse(res, 201, 'Co-working space created successfully', space);
});

// Admin GET /api/admin/spaces
export const getAdminSpaces = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const statusStr = qs(req.query.status);
  const isActiveStr = qs(req.query.isActive);
  const isActive =
    isActiveStr !== undefined
      ? isActiveStr === 'true'
      : statusStr === 'active'
        ? true
        : statusStr === 'inactive'
          ? false
          : undefined;

  const result = await SpacesService.getAllSpaces({
    search: qs(req.query.search),
    type: qs(req.query.type),
    capacity: qn(req.query.capacity),
    minCapacity: qn(req.query.minCapacity),
    maxCapacity: qn(req.query.maxCapacity),
    minPrice: qn(req.query.minPrice),
    maxPrice: qn(req.query.maxPrice),
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: qs(req.query.sortBy),
    sortOrder: qs(req.query.sortOrder) as 'asc' | 'desc' | undefined,
    isActive,
  });
  return sendResponse(res, 200, 'Admin spaces list retrieved successfully', result);
});

// Admin GET /api/admin/spaces/:id
export const getAdminSpaceDetail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const space = await SpacesService.getSpaceById(String(req.params.id), true);
  return sendResponse(res, 200, 'Admin space details & history retrieved successfully', space);
});

// Admin PATCH /api/admin/spaces/:id
export const updateSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const space = await SpacesService.updateSpace(String(req.params.id), req.body);
  return sendResponse(res, 200, 'Space updated successfully', space);
});

// Admin DELETE /api/admin/spaces/:id
export const deleteSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await SpacesService.deleteSpace(String(req.params.id));
  return sendResponse(res, 200, 'Space deactivated successfully');
});

