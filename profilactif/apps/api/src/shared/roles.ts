// Source unique de vérité des rôles. Doit rester alignée avec l'ENUM
// `app_user.role` du schéma MySQL et avec le front.

export const ROLES = ['seeker', 'recruiter', 'admin'] as const
export type Role = (typeof ROLES)[number]

// Rôles qu'un visiteur peut choisir lui-même à l'inscription.
// `admin` en est volontairement absent : ces comptes se créent en base.
export const SIGNUP_ROLES = ['seeker', 'recruiter'] as const
export type SignupRole = (typeof SIGNUP_ROLES)[number]

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}
