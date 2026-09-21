import { z } from 'zod';

export const checkAvailabilitySchema = z.object({
  body: z.object({
    spaceId: z.string().uuid('Invalid space ID format'),
    startTime: z.string().datetime({ message: 'Invalid ISO 8601 start time format' }),
    endTime: z.string().datetime({ message: 'Invalid ISO 8601 end time format' }),
  }),
});

export const spaceAvailabilityQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid space ID format'),
  }),
  query: z.object({
    date: z.string().optional(),
  }),
});

export const spaceSlotsQuerySchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid space ID format'),
  }),
  query: z.object({
    date: z.string().optional(),
    durationMinutes: z.string().transform(Number).pipe(z.number().positive()).optional(),
  }),
});

export const calendarQuerySchema = z.object({
  query: z.object({
    spaceId: z.string().uuid().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
