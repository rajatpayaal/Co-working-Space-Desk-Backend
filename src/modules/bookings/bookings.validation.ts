import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    spaceId: z.string().uuid('Invalid space ID format (must be a valid UUID)'),
    startTime: z.string().datetime({ message: 'Invalid ISO 8601 start time format' }),
    endTime: z.string().datetime({ message: 'Invalid ISO 8601 end time format' }),
  }),
});

export const updateBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid booking ID format'),
  }),
  body: z.object({
    startTime: z.string().datetime({ message: 'Invalid ISO 8601 start time format' }).optional(),
    endTime: z.string().datetime({ message: 'Invalid ISO 8601 end time format' }).optional(),
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
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  }),
});
