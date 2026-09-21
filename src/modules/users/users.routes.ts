import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  activateUser,
  deactivateUser,
} from './users.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  getUsersQuerySchema,
  userIdParamSchema,
  updateUserSchema,
} from './users.validation.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all registered users (Admin)
 *     description: Retrieve all registered members with search keywords, status filters, role filters, and pagination.
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword by user name or email
 *       - in: query
 *         name: roleId
 *         schema:
 *           type: string
 *         description: Filter by Role UUID
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active/deactivated status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of registered users retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/', validateRequest(getUsersQuerySchema), getUsers);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details and reservation history (Admin)
 *     description: Retrieve detailed user profile, assigned role, and full booking reservation history.
 *     tags:
 *       - Admin User Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:id', validateRequest(userIdParamSchema), getUser);

/**
 * @openapi
 * /api/admin/users/{id}:
 *   patch:
 *     summary: Update user details (Admin)
 *     tags:
 *       - Admin User Management
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
 *               email:
 *                 type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.patch('/:id', validateRequest(updateUserSchema), updateUser);

/**
 * @openapi
 * /api/admin/users/{id}/activate:
 *   patch:
 *     summary: Activate user account (Admin)
 *     tags:
 *       - Admin User Management
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
 *         description: User activated successfully
 */
router.patch('/:id/activate', validateRequest(userIdParamSchema), activateUser);

/**
 * @openapi
 * /api/admin/users/{id}/deactivate:
 *   patch:
 *     summary: Deactivate user account (Admin)
 *     tags:
 *       - Admin User Management
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
 *         description: User deactivated successfully
 */
router.patch('/:id/deactivate', validateRequest(userIdParamSchema), deactivateUser);

export default router;
