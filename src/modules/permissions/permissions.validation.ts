import { z } from 'zod';

export const roleIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid role ID format'),
  }),
});

export const updateRolePermissionsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid role ID format'),
  }),
  body: z.object({
    permissionIds: z
      .array(z.string().uuid('Each permission ID must be a valid UUID'))
      .nonempty('permissionIds array cannot be empty'),
  }),
});
