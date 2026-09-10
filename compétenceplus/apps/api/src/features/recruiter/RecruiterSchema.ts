import { z } from 'zod'

export const updateRecruiterSchema = z.object({
  firstName: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  lastName: z
    .string()
    .min(1)
    .max(100)
    .optional(),

  phone: z
    .string()
    .max(30)
    .nullable()
    .optional(),
})

export type UpdateRecruiterInput =
  z.infer<typeof updateRecruiterSchema>