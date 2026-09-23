import { Response } from 'express';
import { PermissionsService } from './permissions.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 44. GET /api/admin/permissions
export const getPermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const permissions = await PermissionsService.getAllPermissions({
    search: req.query.search as string | undefined,
    module: req.query.module as string | undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 100,
  });
  return sendResponse(res, 200, 'Permissions retrieved successfully', permissions);
});

// 45. GET /api/admin/roles/:id/permissions
export const getRolePermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const roleId = req.params.id as string;
  const result = await PermissionsService.getRolePermissions(roleId);
  return sendResponse(res, 200, 'Role permissions retrieved successfully', result);
});

// 46. PUT /api/admin/roles/:id/permissions
export const updateRolePermissions = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const roleId = req.params.id as string;
    const { permissionIds } = req.body;
    const result = await PermissionsService.assignRolePermissions(roleId, permissionIds || []);
    return sendResponse(res, 200, 'Role permissions updated successfully', result);
  }
);
