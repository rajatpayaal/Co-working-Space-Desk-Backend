import { Router } from 'express';
import {
  getSpaces,
  getSpace,
  createSpace,
  getAdminSpaces,
  getAdminSpaceDetail,
  updateSpace,
  deleteSpace,
} from './spaces.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  getSpacesQuerySchema,
  spaceIdParamSchema,
  createSpaceSchema,
  updateSpaceSchema,
} from './spaces.validation.js';

const router = Router();

// Visitor / Public Routes
router.get('/', validateRequest(getSpacesQuerySchema), getSpaces);
router.get('/:id', validateRequest(spaceIdParamSchema), getSpace);

// Admin Routes Middleware
const adminRouter = Router();
adminRouter.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/spaces:
 *   post:
 *     summary: Create a new co-working space (Admin)
 *     description: Add a new desk space or conference room to the catalog.
 *     tags:
 *       - Admin Spaces Management
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
 *               - capacity:
 *               - pricePerHour:
 *             properties:
 *               name:
 *                 type: string
 *                 example: Private Executive Suite C
 *               description:
 *                 type: string
 *                 example: Dedicated 8-person conference room with whiteboards
 *               capacity:
 *                 type: integer
 *                 example: 8
 *               pricePerHour:
 *                 type: number
 *                 example: 35.0
 *     responses:
 *       201:
 *         description: Space created successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden - Admin role required
 */
adminRouter.post('/spaces', validateRequest(createSpaceSchema), createSpace);

/**
 * @openapi
 * /api/admin/spaces:
 *   get:
 *     summary: List and manage all co-working spaces (Admin)
 *     description: Retrieve all spaces (active & inactive) with search filters, capacity/price ranges, and pagination.
 *     tags:
 *       - Admin Spaces Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword
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
 *         description: Admin spaces list retrieved successfully
 */
adminRouter.get('/spaces', validateRequest(getSpacesQuerySchema), getAdminSpaces);

/**
 * @openapi
 * /api/admin/spaces/{id}:
 *   get:
 *     summary: Get space details with full history (Admin)
 *     description: Retrieve space details along with complete maintenance log and booking reservation history.
 *     tags:
 *       - Admin Spaces Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Space UUID
 *     responses:
 *       200:
 *         description: Admin space details retrieved successfully
 *       404:
 *         description: Space not found
 */
adminRouter.get('/spaces/:id', validateRequest(spaceIdParamSchema), getAdminSpaceDetail);

/**
 * @openapi
 * /api/admin/spaces/{id}:
 *   patch:
 *     summary: Update space details (Admin)
 *     tags:
 *       - Admin Spaces Management
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
 *               capacity:
 *                 type: integer
 *               pricePerHour:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Space updated successfully
 */
adminRouter.patch('/spaces/:id', validateRequest(updateSpaceSchema), updateSpace);

/**
 * @openapi
 * /api/admin/spaces/{id}:
 *   delete:
 *     summary: Delete / Deactivate co-working space (Admin)
 *     tags:
 *       - Admin Spaces Management
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
 *         description: Space deactivated successfully
 */
adminRouter.delete('/spaces/:id', validateRequest(spaceIdParamSchema), deleteSpace);

export { adminRouter };
export default router;
