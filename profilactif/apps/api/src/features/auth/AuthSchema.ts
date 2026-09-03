
import { z } from '@hono/zod-openapi'
import { ROLES_INSCRIPTION } from '../../shared/roles.js'

// Normalisé avant validation : « Camille@Exemple.FR » et « camille@exemple.fr » sont le même compte.
const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Adresse email invalide').max(255))
  .openapi({ example: 'camille.durand@exemple.fr' })

// 72 caractères = limite au-delà de laquelle bcrypt tronque silencieusement.
const MotDePasseSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe ne peut pas dépasser 72 caractères')
  .openapi({ example: 'motdepasse123' })

const NomSchema = z
  .string()
  .trim()
  .min(1, 'Ce champ est requis')
  .max(100, 'Ce champ ne peut pas dépasser 100 caractères')

export const InscriptionSchema = z
  .object({
    prenom: NomSchema.openapi({ example: 'Camille' }),
    nom: NomSchema.openapi({ example: 'Durand' }),
    email: EmailSchema,
    motDePasse: MotDePasseSchema,
    role: z.enum(ROLES_INSCRIPTION).openapi({
      description: "Rôle choisi à l'inscription. `admin` n'est pas proposé : ces comptes se créent en base.",
      example: 'demandeur',
    }),
  })
  .openapi('Inscription')

export const ConnexionSchema = z
  .object({
    email: EmailSchema,
    motDePasse: z.string().min(1, 'Mot de passe requis'),
  })
  .openapi('Connexion')

// Vue publique d'un utilisateur : jamais le hash du mot de passe.
export const UtilisateurPublicSchema = z
  .object({
    id: z.number().int().positive().openapi({ example: 1 }),
    prenom: z.string().openapi({ example: 'Camille' }),
    nom: z.string().openapi({ example: 'Durand' }),
    email: z.string().openapi({ example: 'camille.durand@exemple.fr' }),
    role: z.enum(['demandeur', 'recruteur', 'admin']).openapi({ example: 'demandeur' }),
    creeLe: z.string().openapi({ example: '2026-09-02 14:31:07' }),
  })
  .openapi('UtilisateurPublic')

export const ReponseAuthSchema = z
  .object({
    token: z.string().openapi({ description: "À renvoyer dans l'en-tête `Authorization: Bearer <token>`." }),
    utilisateur: UtilisateurPublicSchema,
  })
  .openapi('ReponseAuth')

export type Inscription = z.infer<typeof InscriptionSchema>
export type Connexion = z.infer<typeof ConnexionSchema>
export type UtilisateurPublic = z.infer<typeof UtilisateurPublicSchema>
export type ReponseAuth = z.infer<typeof ReponseAuthSchema>
