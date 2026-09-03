import { z } from 'zod'

export const createQuestionnaireSchema = z.object({
  code: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  content: z.record(z.unknown()),
})

export const createAttemptSchema = z.object({
  questionnaireVersionId: z.string().uuid(),
  answers: z.record(z.unknown()).default({}),
})

export const updateAttemptSchema = z.object({
  answers: z.record(z.unknown()),
  status: z.enum(['in_progress', 'submitted', 'abandoned']).optional(),
  score: z.number().min(0).max(100).nullable().optional(),
})

export type CreateQuestionnaireVersionInput = z.infer<typeof createQuestionnaireSchema>
export type CreateAttemptInput = z.infer<typeof createAttemptSchema>
export type UpdateAttemptInput = z.infer<typeof updateAttemptSchema>
