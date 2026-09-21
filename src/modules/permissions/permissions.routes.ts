import { Router } from 'express';
import {
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
} from './permissions.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  roleIdParamSchema,
  updateRolePermissionsSchema,
} from './permissions.validation.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/permissions:
 *   get:
 *     summary: List all system permissions (Admin)
 *     description: Retrieve all available RBAC permissions configured in the system.
 *     tags:
 *       - Admin Permission Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System permissions list retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/', getPermissions);

/**
 * @openapi
 * /api/admin/roles/{id}/permissions:
 *   get:
 *     summary: Get permissions assigned to a specific role (Admin)
 *     tags:
 *       - Admin Permission Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role UUID
 *     responses:
 *       200:
 *         description: Role permissions retrieved successfully
 *       404:
 *         description: Role not found
 */
router.get('/roles/:id/permissions', validateRequest(roleIdParamSchema), getRolePermissions);

/**
 * @openapi
 * /api/admin/roles/{id}/permissions:
 *   put:
 *     summary: Assign / update permissions for a role (Admin)
 *     description: Atomically replace the permissions array assigned to an RBAC role.
 *     tags:
 *       - Admin Permission Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Role UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds:
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"]
 *     responses:
 *       200:
 *         description: Role permissions updated successfully
 *       400:
 *         description: Validation error or invalid permission UUIDs
 */
router.put('/roles/:id/permissions', validateRequest(updateRolePermissionsSchema), updateRolePermissions);

export default router;
