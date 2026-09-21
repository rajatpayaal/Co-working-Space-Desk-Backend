import { z } from 'zod';

export const getSpacesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    minCapacity: z.string().transform(Number).pipe(z.number().positive()).optional(),
    maxCapacity: z.string().transform(Number).pipe(z.number().positive()).optional(),
    minPrice: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    sortBy: z.enum(['name', 'pricePerHour', 'capacity', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const spaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid space ID format (must be a valid UUID)'),
  }),
});
