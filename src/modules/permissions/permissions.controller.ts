import { Response } from 'express';
import { PermissionsService } from './permissions.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const getPermissions = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  const permissions = await PermissionsService.getAllPermissions();
  return sendResponse(res, 200, 'Permissions retrieved successfully', permissions);
});

export const getRolePermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const roleId = req.params.roleId as string;
  const rolePermissions = await PermissionsService.getRolePermissions(roleId);
  return sendResponse(res, 200, 'Role permissions retrieved successfully', rolePermissions);
});

export const updateRolePermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const roleId = req.params.roleId as string;
    const { permissionIds } = req.body;
    await PermissionsService.assignRolePermissions(roleId, permissionIds || []);
    return sendResponse(res, 200, 'Role permissions updated successfully');
  }
);
