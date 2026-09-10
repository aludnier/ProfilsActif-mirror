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

export const questionTypeEnum = z.enum(['single', 'multiple'])

export const createQuestionSchema = z.object({
  question: z.string().trim().min(1).max(300),
  responses: z.array(z.string()).min(2),
  type: questionTypeEnum,
  weight: z.number().min(0)
})

export type CreateQuestionnaireVersionInput = z.infer<typeof createQuestionnaireSchema>
export type CreateAttemptInput = z.infer<typeof createAttemptSchema>
export type UpdateAttemptInput = z.infer<typeof updateAttemptSchema>
export type QuestionTypeInput = z.infer<typeof questionTypeEnum>
export type createQuestionInput = z.infer<typeof createQuestionSchema>
