import { z } from 'zod'

export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  role: z.enum(['seeker', 'recruiter', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'deleted']).optional(),
})

export const updateUserStatusSchema = z.object({
  // La suppression définitive passe exclusivement par DELETE /admin/users/:id.
  status: z.enum(['active', 'suspended']),
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['seeker', 'recruiter', 'admin']),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
export type UpdateUserStatusInput = z.infer<
  typeof updateUserStatusSchema
>
export type UpdateUserRoleInput = z.infer<
  typeof updateUserRoleSchema
>
export const updateUserProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  mail: z.string().trim().email().max(255).optional(),
})
export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>
