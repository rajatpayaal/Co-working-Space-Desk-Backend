import { Router } from 'express';
import { getDashboardStats, getBookingTrends } from './dashboard.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/booking-trends', getBookingTrends);

export default router;
