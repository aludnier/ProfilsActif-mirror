import { z } from 'zod'

export const createSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom de la compétence est requis')
    .max(100, 'Le nom de la compétence est trop long'),
})

export const updateSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Le nom de la compétence est requis')
    .max(100, 'Le nom de la compétence est trop long'),
})

export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>