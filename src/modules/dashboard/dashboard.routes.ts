import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardBookings,
  getRevenueStats,
  getActivityFeed,
  getBookingTrends,
} from './dashboard.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get admin dashboard statistics (47)
 *     description: Retrieve total users, total spaces, total bookings, pending & approved booking counts, and maintenance stats.
 *     tags:
 *       - Admin Dashboard Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics metrics
 *       403:
 *         description: Forbidden - Admin role required
 */
router.get('/stats', getDashboardStats);

/**
 * @openapi
 * /api/admin/dashboard/bookings:
 *   get:
 *     summary: Get dashboard recent bookings summary (48)
 *     tags:
 *       - Admin Dashboard Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent bookings list retrieved successfully
 */
router.get('/bookings', getDashboardBookings);

/**
 * @openapi
 * /api/admin/dashboard/revenue:
 *   get:
 *     summary: Get estimated revenue metrics (49)
 *     tags:
 *       - Admin Dashboard Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Total estimated revenue calculated from approved space bookings
 */
router.get('/revenue', getRevenueStats);

/**
 * @openapi
 * /api/admin/dashboard/activity:
 *   get:
 *     summary: Get admin dashboard activity feed (50)
 *     tags:
 *       - Admin Dashboard Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity feed of new user registrations and desk bookings
 */
router.get('/activity', getActivityFeed);

/**
 * @openapi
 * /api/admin/dashboard/booking-trends:
 *   get:
 *     summary: Get booking status trend analytics (51)
 *     tags:
 *       - Admin Dashboard Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Grouped counts of bookings by status (APPROVED, PENDING, REJECTED, CANCELLED)
 */
router.get('/booking-trends', getBookingTrends);

export default router;
