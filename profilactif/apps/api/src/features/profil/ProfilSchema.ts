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
})

export type UpdateProfilInput = z.infer<typeof updateProfilSchema>