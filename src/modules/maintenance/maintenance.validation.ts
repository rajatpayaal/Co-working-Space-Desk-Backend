import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  body: z.object({
    spaceId: z.string().uuid('Invalid space ID format (must be a valid UUID)'),
    startTime: z.string().datetime({ message: 'Invalid ISO 8601 start time format' }),
    endTime: z.string().datetime({ message: 'Invalid ISO 8601 end time format' }),
    reason: z.string().optional(),
  }),
});

export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance ID format'),
  }),
  body: z.object({
    startTime: z.string().datetime({ message: 'Invalid ISO 8601 start time format' }).optional(),
    endTime: z.string().datetime({ message: 'Invalid ISO 8601 end time format' }).optional(),
    reason: z.string().optional(),
  }),
});

export const maintenanceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance ID format'),
  }),
});

export const getMaintenanceQuerySchema = z.object({
  query: z.object({
    spaceId: z.string().uuid().optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  }),
});
