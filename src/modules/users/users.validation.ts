import { z } from 'zod';

export const userIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format (must be a valid UUID)'),
  }),
});

export const getUsersQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    roleId: z.string().uuid().optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
    status: z.enum(['active', 'inactive']).optional(),
    sortBy: z.enum(['createdAt', 'name', 'email']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID format'),
  }),
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address format').optional(),
    roleId: z.string().uuid().optional().nullable(),
  }),
});
