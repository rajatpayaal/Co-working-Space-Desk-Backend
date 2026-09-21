import { Router } from 'express';
import { checkSpaceAvailability, getAvailabilityCalendar } from './availability.controller.js';

const router = Router();

router.post('/check', checkSpaceAvailability);
router.get('/calendar', getAvailabilityCalendar);

export default router;
