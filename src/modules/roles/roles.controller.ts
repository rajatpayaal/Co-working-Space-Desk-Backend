import { Response } from 'express';
import { RolesService } from './roles.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// GET /api/admin/roles
export const getRoles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const roles = await RolesService.getAllRoles({
    search: req.query.search ? String(req.query.search) : undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 50,
  });
  return sendResponse(res, 200, 'Roles retrieved successfully', roles);
});

// POST /api/admin/roles
export const createRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = await RolesService.createRole(req.body.name, req.body.description);
  return sendResponse(res, 201, 'Role created successfully', role);
});

// GET /api/admin/roles/:id
export const getRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = await RolesService.getRoleById(String(req.params.id));
  return sendResponse(res, 200, 'Role details retrieved successfully', role);
});

// PATCH /api/admin/roles/:id
export const updateRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const role = await RolesService.updateRole(String(req.params.id), req.body);
  return sendResponse(res, 200, 'Role updated successfully', role);
});

// DELETE /api/admin/roles/:id
export const deleteRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await RolesService.deleteRole(String(req.params.id));
  return sendResponse(res, 200, 'Role deleted successfully');
});

// GET /api/admin/roles/:id/permissions
export const getRolePermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await RolesService.getRolePermissions(String(req.params.id));
  return sendResponse(res, 200, 'Role permissions retrieved successfully', result);
});

// PUT /api/admin/roles/:id/permissions — full replacement
export const setRolePermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { permissionIds } = req.body;
  const result = await RolesService.setRolePermissions(String(req.params.id), permissionIds);
  return sendResponse(res, 200, 'Role permissions updated successfully', result);
});

