import { Router } from 'express';
import { getSpaces, getSpace, createSpace, updateSpace, deleteSpace } from './spaces.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/spaces:
 *   get:
 *     summary: List co-working spaces (Public / Visitor)
 *     description: Retrieve list of active co-working spaces with search, capacity/price filters, and pagination.
 *     tags:
 *       - Visitor / Public Spaces
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search keyword by space name or description
 *       - in: query
 *         name: minCapacity
 *         schema:
 *           type: integer
 *         description: Filter spaces with minimum desk capacity
 *       - in: query
 *         name: maxCapacity
 *         schema:
 *           type: integer
 *         description: Filter spaces with maximum desk capacity
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per hour
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per hour
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, pricePerHour, capacity, createdAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Spaces retrieved successfully with pagination
 */
router.get('/', getSpaces);

/**
 * @openapi
 * /api/spaces/{id}:
 *   get:
 *     summary: Get space details by ID (Public / Visitor)
 *     description: Retrieve detailed information for a specific co-working space including upcoming maintenance windows.
 *     tags:
 *       - Visitor / Public Spaces
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique Space UUID
 *     responses:
 *       200:
 *         description: Space details retrieved successfully
 *       404:
 *         description: Space not found
 */
router.get('/:id', getSpace);

/**
 * @openapi
 * /api/spaces:
 *   post:
 *     summary: Create a new co-working space (Admin only)
 *     tags:
 *       - Admin Space Management
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
 *                 example: Deluxe Conference Room B
 *               description:
 *                 type: string
 *                 example: High-speed fiber internet with 4K display monitor
 *               capacity:
 *                 type: integer
 *                 example: 10
 *               pricePerHour:
 *                 type: number
 *                 example: 45.0
 *     responses:
 *       201:
 *         description: Space created successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
router.post('/', authenticateJWT, requireAdmin, createSpace);

/**
 * @openapi
 * /api/spaces/{id}:
 *   patch:
 *     summary: Update space details (Admin only)
 *     tags:
 *       - Admin Space Management
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
router.patch('/:id', authenticateJWT, requireAdmin, updateSpace);

/**
 * @openapi
 * /api/spaces/{id}:
 *   delete:
 *     summary: Deactivate co-working space (Admin only)
 *     tags:
 *       - Admin Space Management
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
router.delete('/:id', authenticateJWT, requireAdmin, deleteSpace);

export default router;
