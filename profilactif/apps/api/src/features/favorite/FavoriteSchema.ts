import { z } from 'zod'

export const createFavoriteSchema = z.object({
  recruiterId: z.string().uuid(),
  seekerId: z.string().uuid(),
})

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>