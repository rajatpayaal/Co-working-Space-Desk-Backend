import { z } from 'zod';

export const getSpacesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    type: z.string().optional(),
    capacity: z.string().transform(Number).pipe(z.number().positive()).optional(),
    minCapacity: z.string().transform(Number).pipe(z.number().positive()).optional(),
    maxCapacity: z.string().transform(Number).pipe(z.number().positive()).optional(),
    minPrice: z.string().transform(Number).pipe(z.number().nonnegative()).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().positive()).optional(),
    date: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    sortBy: z.enum(['name', 'pricePerHour', 'capacity', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    status: z.string().optional(),
  }),
});

export const spaceIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid space ID format (must be a valid UUID)'),
  }),
});

export const createSpaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Space name must be at least 2 characters long'),
    type: z.string().optional(),
    description: z.string().optional(),
    capacity: z.number().int().positive('Capacity must be a positive integer'),
    pricePerHour: z.number().positive('Price per hour must be a positive number'),
    priceUnit: z.string().optional(),
    location: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const updateSpaceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid space ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    pricePerHour: z.number().positive().optional(),
    priceUnit: z.string().optional(),
    location: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string()).optional(),
    rules: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});
