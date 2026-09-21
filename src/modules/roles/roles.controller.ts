import { Response } from 'express';
import { RolesService } from './roles.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 39. GET /api/admin/roles
export const getRoles = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const roles = await RolesService.getAllRoles();
  return sendResponse(res, 200, 'Roles retrieved successfully', roles);
});

// 40. POST /api/admin/roles
export const createRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = await RolesService.createRole(req.body.name, req.body.description);
  return sendResponse(res, 201, 'Role created successfully', role);
});

// 41. GET /api/admin/roles/:id
export const getRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const role = await RolesService.getRoleById(id);
  return sendResponse(res, 200, 'Role details retrieved successfully', role);
});

// 42. PATCH /api/admin/roles/:id
export const updateRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const role = await RolesService.updateRole(id, req.body);
  return sendResponse(res, 200, 'Role updated successfully', role);
});

// 43. DELETE /api/admin/roles/:id
export const deleteRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  await RolesService.deleteRole(id);
  return sendResponse(res, 200, 'Role deleted successfully');
});
