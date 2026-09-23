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
  cancelBookingSchema,
  rejectBookingSchema,
  bookingIdParamSchema,
  getBookingsQuerySchema,
} from './bookings.validation.js';

const router = Router();

// ─── Member Routes ────────────────────────────────────────────
router.use('/bookings', authenticateJWT);

router.post('/bookings', requireMember, validateRequest(createBookingSchema), createBooking);
router.get('/bookings', requireMember, validateRequest(getBookingsQuerySchema), getMyBookings);
router.get('/bookings/:id', requireMember, validateRequest(bookingIdParamSchema), getBookingDetails);
router.patch('/bookings/:id', requireMember, validateRequest(updateBookingSchema), updateBooking);
router.post('/bookings/:id/cancel', requireMember, validateRequest(cancelBookingSchema), cancelBooking);

// ─── Admin Bookings Router ────────────────────────────────────
const adminRouter = Router();
adminRouter.use(authenticateJWT, requireAdmin);

adminRouter.get('/bookings', validateRequest(getBookingsQuerySchema), getAllBookingsAdmin);
adminRouter.get('/bookings/:id', validateRequest(bookingIdParamSchema), getAdminBookingDetails);
adminRouter.patch('/bookings/:id/approve', validateRequest(bookingIdParamSchema), approveBookingAdmin);
adminRouter.patch('/bookings/:id/reject', validateRequest(rejectBookingSchema), rejectBookingAdmin);

export { adminRouter as adminBookingsRouter };
export default router;
