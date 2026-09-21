import { Response } from 'express';
import { UsersService } from './users.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getUsers = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const users = await UsersService.getAllUsers();
  return sendResponse(res, 200, 'Users retrieved successfully', users);
});

export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.getUserById(id);
  return sendResponse(res, 200, 'User details retrieved successfully', user);
});

export const activateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.updateUserStatus(id, true);
  return sendResponse(res, 200, 'User activated successfully', user);
});

export const deactivateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.updateUserStatus(id, false);
  return sendResponse(res, 200, 'User deactivated successfully', user);
});
