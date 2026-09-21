import { Response } from 'express';
import { SpacesService } from './spaces.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 09. GET /api/spaces
export const getSpaces = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await SpacesService.getAllSpaces({
    search: req.query.search as string,
    minCapacity: req.query.minCapacity ? Number(req.query.minCapacity) : undefined,
    maxCapacity: req.query.maxCapacity ? Number(req.query.maxCapacity) : undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 10,
    sortBy: req.query.sortBy as string,
    sortOrder: req.query.sortOrder as 'asc' | 'desc',
    isActive: true,
  });

  return sendResponse(res, 200, 'Public spaces list retrieved successfully', result);
});

// 10. GET /api/spaces/:id
export const getSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const space = await SpacesService.getSpaceById(id);
  return sendResponse(res, 200, 'Space details retrieved successfully', space);
});

export const createSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const space = await SpacesService.createSpace(req.body);
  return sendResponse(res, 201, 'Space created successfully', space);
});

export const updateSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const space = await SpacesService.updateSpace(id, req.body);
  return sendResponse(res, 200, 'Space updated successfully', space);
});

export const deleteSpace = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  await SpacesService.deleteSpace(id);
  return sendResponse(res, 200, 'Space deactivated successfully');
});
