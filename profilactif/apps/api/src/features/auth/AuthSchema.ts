import { z } from 'zod'

import { SIGNUP_ROLES } from '../../shared/roles.js'

// Email normalisé avant validation : « Jean@Test.FR » et « jean@test.fr »
// sont le même compte.
const mailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.string().email('Adresse email invalide').max(255))

// 72 caractères = limite au-delà de laquelle bcrypt tronque silencieusement.
const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe ne peut pas dépasser 72 caractères')

const nameSchema = z.string().trim().min(1, 'Ce champ est requis').max(100, 'Ce champ est trop long')
const optionalTextSchema = z.string().trim().max(150).optional()

export const signupSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  mail: mailSchema,
  phone: z.string().trim().max(30).optional(),
  password: passwordSchema,
  role: z.enum(SIGNUP_ROLES),
  location: optionalTextSchema,
  targetSector: optionalTextSchema,
})

export const loginSchema = z.object({
  mail: mailSchema,
  password: z.string().min(1, 'Mot de passe requis'),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>

// Vue publique d'un utilisateur : jamais le hash du mot de passe.
export type PublicUser = {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  role: 'seeker' | 'recruiter' | 'admin'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: string
}

export type AuthResponse = {
  token: string
  user: PublicUser
}
