import { Response } from 'express';
import { RolesService } from './roles.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getRoles = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const roles = await RolesService.getAllRoles();
  return sendResponse(res, 200, 'Roles retrieved successfully', roles);
});

export const createRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = await RolesService.createRole(req.body.name, req.body.description);
  return sendResponse(res, 201, 'Role created successfully', role);
});

export const getRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const role = await RolesService.getRoleById(id);
  return sendResponse(res, 200, 'Role details retrieved successfully', role);
});

export const deleteRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  await RolesService.deleteRole(id);
  return sendResponse(res, 200, 'Role deleted successfully');
});
