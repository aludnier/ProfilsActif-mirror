import { z } from 'zod'

export const createContactSchema = z.object({
  seekerId: z.string().uuid(),
  message: z.string().trim().min(1).max(5000),
})

export const updateContactSchema = z.object({message: z.string().trim().min(1).max(5000)})

export type CreateContactInput = z.infer<typeof createContactSchema>

export type UpdateContactInput = z.infer<typeof updateContactSchema>