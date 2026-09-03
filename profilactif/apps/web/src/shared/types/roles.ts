/*
 * Front-end mirror of apps/api/src/shared/roles.ts.
 *
 * The two apps are separate workspaces with no shared package: this list is
 * therefore duplicated on purpose, and must stay aligned with the
 * `utilisateur.role` ENUM in the MySQL schema and with the API's definition.
 */

export const ROLES = ['demandeur', 'recruteur', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/*
 * What a visitor can choose for themselves at signup. `admin` is
 * deliberately absent: an admin account is created in the database (seed) or
 * by another admin, never through the public form.
 */
export const ROLES_INSCRIPTION = ['demandeur', 'recruteur'] as const;
export type RoleInscription = (typeof ROLES_INSCRIPTION)[number];

/** Displayable labels, the technical code stays in the database. */
export const LIBELLES_ROLE: Record<Role, string> = {
  demandeur: 'Candidat',
  recruteur: 'Recruteur',
  admin: 'Administrateur',
};
