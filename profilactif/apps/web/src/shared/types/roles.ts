/*
 * Miroir front de apps/api/src/shared/roles.ts.
 *
 * Les deux applications sont des workspaces distincts sans paquet partagé :
 * cette liste est donc dupliquée à dessein, et doit rester alignée sur
 * l'ENUM `utilisateur.role` du schéma MySQL et sur la définition de l'API.
 */

export const ROLES = ['demandeur', 'recruteur', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/*
 * Ce qu'un visiteur peut choisir lui-même à l'inscription. `admin` en est
 * volontairement absent : un compte administrateur se crée en base (seed) ou
 * par un autre admin, jamais via le formulaire public.
 */
export const ROLES_INSCRIPTION = ['demandeur', 'recruteur'] as const;
export type RoleInscription = (typeof ROLES_INSCRIPTION)[number];

/** Libellés affichables, le code technique restant en base. */
export const LIBELLES_ROLE: Record<Role, string> = {
  demandeur: 'Candidat',
  recruteur: 'Recruteur',
  admin: 'Administrateur',
};
