
 // source unique de vérité des rôles. Doit rester alignée avec l'ENUM l`utilisateur.role` du schéma MySQL et avec le front.

export const ROLES = ['demandeur', 'recruteur', 'admin'] as const
export type Role = (typeof ROLES)[number]

 // un visiteur peut choisir lui-même à l'inscription.
 //`admin` en est volontairement absent : un compte administrateur se crée
 //en base (seed) ou par un autre admin, jamais via l'API publique.
 
export const ROLES_INSCRIPTION = ['demandeur', 'recruteur'] as const
export type RoleInscription = (typeof ROLES_INSCRIPTION)[number]

export function estRole(valeur: unknown): valeur is Role {
  return typeof valeur === 'string' && (ROLES as readonly string[]).includes(valeur)
}
