import { Response } from 'express';
import { UsersService } from './users.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 34. GET /api/admin/users
export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const search = req.query.search as string | undefined;
  const roleId = req.query.roleId as string | undefined;
  const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const result = await UsersService.getAllUsers({ search, roleId, isActive, page, limit });
  return sendResponse(res, 200, 'Users retrieved successfully', result);
});

// 35. GET /api/admin/users/:id
export const getUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.getUserById(id);
  return sendResponse(res, 200, 'User details retrieved successfully', user);
});

// 36. PATCH /api/admin/users/:id
export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.updateUser(id, req.body);
  return sendResponse(res, 200, 'User updated successfully', user);
});

// 37. PATCH /api/admin/users/:id/activate
export const activateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.updateUserStatus(id, true);
  return sendResponse(res, 200, 'User activated successfully', user);
});

// 38. PATCH /api/admin/users/:id/deactivate
export const deactivateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const user = await UsersService.updateUserStatus(id, false);
  return sendResponse(res, 200, 'User deactivated successfully', user);
});
