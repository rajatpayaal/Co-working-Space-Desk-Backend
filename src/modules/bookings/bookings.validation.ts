import { z } from 'zod';

// Flexible time: accepts ISO datetime string OR "HH:MM" format
const flexibleTime = z.string().refine(
  (v) => /^\d{2}:\d{2}$/.test(v) || /^\d{4}-\d{2}-\d{2}T/.test(v),
  { message: 'Time must be ISO datetime or HH:MM format' }
);

export const createBookingSchema = z.object({
  body: z.object({
    spaceId: z.string().uuid('Invalid space ID format (must be a valid UUID)'),
    date: z.string().optional(),           // YYYY-MM-DD (for HH:MM format)
    startTime: flexibleTime,
    endTime: flexibleTime,
    notes: z.string().optional(),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    startTime: flexibleTime.optional(),
    endTime: flexibleTime.optional(),
    notes: z.string().optional(),
  }),
});

export const cancelBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});

export const bookingIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
});

export const getBookingsQuerySchema = z.object({
  query: z.object({
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']).optional(),
    spaceId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    date: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.enum(['createdAt', 'startTime', 'status']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  }),
});

export const rejectBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    reason: z.string().optional(),
  }),
});
