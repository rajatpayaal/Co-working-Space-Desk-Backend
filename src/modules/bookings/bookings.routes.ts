import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingDetails,
  cancelBooking,
  getAllBookingsAdmin,
  approveBookingAdmin,
  rejectBookingAdmin,
} from './bookings.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

// Member Routes
router.use(authenticateJWT);

router.post('/', createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingDetails);
router.post('/:id/cancel', cancelBooking);

// Admin Management Routes
router.get('/admin/all', requireAdmin, getAllBookingsAdmin);
router.patch('/admin/:id/approve', requireAdmin, approveBookingAdmin);
router.patch('/admin/:id/reject', requireAdmin, rejectBookingAdmin);

export default router;
