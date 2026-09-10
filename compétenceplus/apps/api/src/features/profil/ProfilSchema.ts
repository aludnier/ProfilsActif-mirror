import { z } from 'zod'

export const updateProfilSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Le prénom est obligatoire')
    .max(100)
    .optional(),

  lastName: z
    .string()
    .min(1, 'Le nom est obligatoire')
    .max(100)
    .optional(),

  phone: z
    .string()
    .max(30)
    .nullable()
    .optional(),

  age: z
    .coerce.number()
    .int('L’âge doit être un nombre entier')
    .min(0, 'L’âge ne peut pas être négatif')
    .max(120, 'L’âge ne peut pas dépasser 120 ans')
    .nullable()
    .optional(),

  location: z
    .string()
    .min(1, 'La localisation est obligatoire')
    .max(150)
    .optional(),

  targetSector: z
    .string()
    .max(150)
    .nullable()
    .optional(),

  bio: z
    .string()
    .max(2000, 'La présentation ne peut pas dépasser 2000 caractères')
    .nullable()
    .optional(),

  employmentType: z.enum(['full_time', 'part_time', 'freelance', 'internship']).nullable().optional(),
  contractStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  contractEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  workMode: z.enum(['on_site', 'hybrid', 'remote']).nullable().optional(),
  experienceYears: z.coerce.number().min(0).max(60).nullable().optional(),
  catalogVisible: z.boolean().optional(),
})

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>

export const updateCompetencesSchema = z.object({
  competences: z.array(z.string().trim().min(1).max(150)).max(5),
})

export type UpdateCompetencesInput = z.infer<typeof updateCompetencesSchema>

/* Même forme que la modération vidéo : un statut, un motif facultatif. */
export const moderatePhotoSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().max(500).optional().nullable(),
})

export type ModeratePhotoInput = z.infer<typeof moderatePhotoSchema>

