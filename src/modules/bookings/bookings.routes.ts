import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingDetails,
  updateBooking,
  cancelBooking,
  getAllBookingsAdmin,
  getAdminBookingDetails,
  approveBookingAdmin,
  rejectBookingAdmin,
} from './bookings.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin, requireMember } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamSchema,
  getBookingsQuerySchema,
} from './bookings.validation.js';

const router = Router();

// Member Routes
router.use('/bookings', authenticateJWT);

router.post('/bookings', requireMember, validateRequest(createBookingSchema), createBooking);
router.get('/bookings', requireMember, validateRequest(getBookingsQuerySchema), getMyBookings);
router.get('/bookings/:id', requireMember, validateRequest(bookingIdParamSchema), getBookingDetails);
router.patch('/bookings/:id', requireMember, validateRequest(updateBookingSchema), updateBooking);
router.post('/bookings/:id/cancel', requireMember, validateRequest(bookingIdParamSchema), cancelBooking);

// Admin Routes
const adminRouter = Router();
adminRouter.use(authenticateJWT, requireAdmin);

/**
 * @openapi
 * /api/admin/bookings:
 *   get:
 *     summary: View all bookings across system (Admin)
 *     description: Retrieve all member reservations with status, space, user, date range filters, and pagination.
 *     tags:
 *       - Admin Bookings Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *         description: Filter by booking status
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *         description: Filter by Space UUID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by User UUID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
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
 *         description: All bookings retrieved successfully
 *       403:
 *         description: Forbidden - Admin role required
 */
adminRouter.get('/bookings', validateRequest(getBookingsQuerySchema), getAllBookingsAdmin);

/**
 * @openapi
 * /api/admin/bookings/{id}:
 *   get:
 *     summary: Get booking details with user and space info (Admin)
 *     tags:
 *       - Admin Bookings Management
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking UUID
 *     responses:
 *       200:
 *         description: Admin booking details retrieved successfully
 *       404:
 *         description: Booking not found
 */
adminRouter.get('/bookings/:id', validateRequest(bookingIdParamSchema), getAdminBookingDetails);

/**
 * @openapi
 * /api/admin/bookings/{id}/approve:
 *   patch:
 *     summary: Approve pending booking & auto-reject overlapping bookings (Admin)
 *     description: Approves the target pending booking and automatically rejects any conflicting pending reservations for the same space.
 *     tags:
 *       - Admin Bookings Management
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
 *         description: Booking approved and overlapping pending bookings auto-rejected
 *       400:
 *         description: Booking is already approved or invalid
 */
adminRouter.patch('/bookings/:id/approve', validateRequest(bookingIdParamSchema), approveBookingAdmin);

/**
 * @openapi
 * /api/admin/bookings/{id}/reject:
 *   patch:
 *     summary: Reject pending booking (Admin)
 *     tags:
 *       - Admin Bookings Management
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
 *         description: Booking rejected successfully
 */
adminRouter.patch('/bookings/:id/reject', validateRequest(bookingIdParamSchema), rejectBookingAdmin);

export { adminRouter as adminBookingsRouter };
export default router;
