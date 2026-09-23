import { Router } from 'express';
import {
  getRoles,
  createRole,
  getRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  setRolePermissions,
} from './roles.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
} from './roles.validation.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/roles:
 *   get:
 *     summary: List all system RBAC roles (Admin)
 *     description: Retrieve all roles along with assigned permissions and active user count.
 *     tags:
 *       - Admin Role Management
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/', getRoles);

/**
 * @openapi
 * /api/admin/roles:
 *   post:
 *     summary: Create new system role (Admin)
 *     tags:
 *       - Admin Role Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name:
 *             properties:
 *               name:
 *                 type: string
 *                 example: FACILITY_MANAGER
 *               description:
 *                 type: string
 *                 example: Role for managing workspace maintenance and space schedules
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Validation error or role name already exists
 */
router.post('/', validateRequest(createRoleSchema), createRole);

/**
 * @openapi
 * /api/admin/roles/{id}:
 *   get:
 *     summary: Get role details by ID (Admin)
 *     tags:
 *       - Admin Role Management
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
 *         description: Role details retrieved successfully
 *       404:
 *         description: Role not found
 */
router.get('/:id', validateRequest(roleIdParamSchema), getRole);

/**
 * @openapi
 * /api/admin/roles/{id}:
 *   patch:
 *     summary: Update role name and description (Admin)
 *     tags:
 *       - Admin Role Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.patch('/:id', validateRequest(updateRoleSchema), updateRole);

/**
 * @openapi
 * /api/admin/roles/{id}:
 *   delete:
 *     summary: Delete system role (Admin)
 *     tags:
 *       - Admin Role Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
router.delete('/:id', validateRequest(roleIdParamSchema), deleteRole);

// GET /api/admin/roles/:id/permissions
router.get('/:id/permissions', validateRequest(roleIdParamSchema), getRolePermissions);

// PUT /api/admin/roles/:id/permissions — full replacement
router.put('/:id/permissions', validateRequest(roleIdParamSchema), setRolePermissions);

export default router;
