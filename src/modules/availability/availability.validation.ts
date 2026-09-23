import { z } from 'zod';

const flexibleTime = z.string().refine(
  (v) => /^\d{2}:\d{2}$/.test(v) || /^\d{4}-\d{2}-\d{2}T/.test(v),
  { message: 'Time must be ISO datetime or HH:MM format' }
);

export const checkAvailabilitySchema = z.object({
  body: z.object({
    spaceId: z.string().uuid('Invalid space ID format'),
    date: z.string().optional(),
    startTime: flexibleTime,
    endTime: flexibleTime,
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
