import { Response } from 'express';
import { SpacesService } from './spaces.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getSpaces = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search as string;
  const spaces = await SpacesService.getAllSpaces({ isActive: true, search });
  return sendResponse(res, 200, 'Spaces retrieved successfully', spaces);
});

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
