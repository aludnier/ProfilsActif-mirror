import { z } from 'zod'

export const createFavoriteSchema = z.object({
  seekerId: z.string().uuid(),
})

export type CreateFavoriteInput = z.infer<typeof createFavoriteSchema>