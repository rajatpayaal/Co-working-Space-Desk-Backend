import { Router } from 'express';
import {
  checkSpaceAvailability,
  getSpaceAvailabilityDetail,
  getAvailableTimeSlots,
  getAvailabilityCalendar,
} from './availability.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  checkAvailabilitySchema,
  spaceAvailabilityQuerySchema,
  spaceSlotsQuerySchema,
  calendarQuerySchema,
} from './availability.validation.js';

const router = Router();

/**
 * @openapi
 * /api/availability/check:
 *   post:
 *     summary: Check space availability for specific date-time range (Visitor / Public)
 *     description: Verify if a co-working space is available without overlapping bookings or maintenance windows.
 *     tags:
 *       - Visitor / Public Availability
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
 *                 example: 2026-10-01T09:00:00.000Z
 *               endTime:
 *                 type: string
 *                 example: 2026-10-01T12:00:00.000Z
 *     responses:
 *       200:
 *         description: Availability status returned
 *       400:
 *         description: Invalid start/end date inputs
 *       404:
 *         description: Space not found
 */
router.post('/check', validateRequest(checkAvailabilitySchema), checkSpaceAvailability);

/**
 * @openapi
 * /api/spaces/{id}/availability:
 *   get:
 *     summary: View space availability for a date (Visitor / Public)
 *     tags:
 *       - Visitor / Public Availability
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Space UUID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD format (defaults to today)
 *     responses:
 *       200:
 *         description: Space availability retrieved
 */
router.get('/spaces/:id/availability', validateRequest(spaceAvailabilityQuerySchema), getSpaceAvailabilityDetail);

/**
 * @openapi
 * /api/spaces/{id}/slots:
 *   get:
 *     summary: View available time slots for a space on a date (Visitor / Public)
 *     tags:
 *       - Visitor / Public Availability
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Space UUID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *         description: Date in YYYY-MM-DD format
 *       - in: query
 *         name: durationMinutes
 *         schema:
 *           type: integer
 *           default: 60
 *         description: Duration in minutes per slot
 *     responses:
 *       200:
 *         description: Available time slots list
 */
router.get('/spaces/:id/slots', validateRequest(spaceSlotsQuerySchema), getAvailableTimeSlots);

/**
 * @openapi
 * /api/availability/calendar:
 *   get:
 *     summary: View availability calendar across spaces (Visitor / Public)
 *     tags:
 *       - Visitor / Public Availability
 *     parameters:
 *       - in: query
 *         name: spaceId
 *         schema:
 *           type: string
 *         description: Optional Space UUID filter
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date ISO format
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date ISO format
 *     responses:
 *       200:
 *         description: Availability calendar events
 */
router.get('/calendar', validateRequest(calendarQuerySchema), getAvailabilityCalendar);

export default router;
