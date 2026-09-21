import { Router } from 'express';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  getMaintenanceDetail,
  updateMaintenanceRecord,
  deleteMaintenanceRecord,
} from './maintenance.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceIdParamSchema,
  getMaintenanceQuerySchema,
} from './maintenance.validation.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/maintenance:
 *   get:
 *     summary: List all maintenance windows (Admin)
 *     description: Retrieve all scheduled space maintenance records with optional spaceId filter and pagination.
 *     tags:
 *       - Admin Maintenance Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *         description: Filter maintenance records by Space UUID
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
 *         description: Maintenance records list retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/', validateRequest(getMaintenanceQuerySchema), getMaintenanceRecords);

/**
 * @openapi
 * /api/admin/maintenance:
 *   post:
 *     summary: Create maintenance window for a space (Admin)
 *     description: Schedule a maintenance window for a co-working space. Blocks user bookings during this timeframe.
 *     tags:
 *       - Admin Maintenance Management
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spaceId:
 *               - startTime:
 *               - endTime:
 *             properties:
 *               spaceId:
 *                 type: string
 *                 example: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
 *               startTime:
 *                 type: string
 *                 example: 2026-11-01T08:00:00.000Z
 *               endTime:
 *                 type: string
 *                 example: 2026-11-01T18:00:00.000Z
 *               reason:
 *                 type: string
 *                 example: HVAC equipment servicing & electrical safety audit
 *     responses:
 *       201:
 *         description: Maintenance window created successfully
 *       400:
 *         description: Validation error or invalid start/end time range
 *       404:
 *         description: Space not found
 */
router.post('/', validateRequest(createMaintenanceSchema), createMaintenanceRecord);

/**
 * @openapi
 * /api/admin/maintenance/{id}:
 *   get:
 *     summary: Get maintenance window details (Admin)
 *     tags:
 *       - Admin Maintenance Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance Record UUID
 *     responses:
 *       200:
 *         description: Maintenance details retrieved successfully
 *       404:
 *         description: Maintenance record not found
 */
router.get('/:id', validateRequest(maintenanceIdParamSchema), getMaintenanceDetail);

/**
 * @openapi
 * /api/admin/maintenance/{id}:
 *   patch:
 *     summary: Update maintenance window details (Admin)
 *     tags:
 *       - Admin Maintenance Management
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
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance window updated successfully
 */
router.patch('/:id', validateRequest(updateMaintenanceSchema), updateMaintenanceRecord);

/**
 * @openapi
 * /api/admin/maintenance/{id}:
 *   delete:
 *     summary: Delete maintenance window (Admin)
 *     tags:
 *       - Admin Maintenance Management
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
 *         description: Maintenance window deleted successfully
 */
router.delete('/:id', validateRequest(maintenanceIdParamSchema), deleteMaintenanceRecord);

export default router;
