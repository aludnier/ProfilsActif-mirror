import { z } from 'zod'

export const createVideoSchema = z.object({
  seekerId: z.string().uuid(),
  url: z.string().url(),
  title: z.string().max(200).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
})

export const updateVideoSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().max(200).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
})

export type CreateVideoInput = z.infer<typeof createVideoSchema>
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>
export const moderateVideoSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().max(500).nullable().optional(),
})
export type ModerateVideoInput = z.infer<typeof moderateVideoSchema>
