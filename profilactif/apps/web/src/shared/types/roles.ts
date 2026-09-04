/*
 * Front-end mirror of apps/api/src/shared/roles.ts.
 *
 * The two apps are separate workspaces with no shared package: this list is
 * therefore duplicated on purpose, and must stay aligned with the
 * `app_user.role` ENUM in the MySQL schema and with the API's definition.
 */

export const ROLES = ['seeker', 'recruiter', 'admin'] as const;
export type Role = (typeof ROLES)[number];

/*
 * What a visitor can choose for themselves at signup. `admin` is
 * deliberately absent: an admin account is created in the database (seed) or
 * by another admin, never through the public form.
 */
export const ROLES_INSCRIPTION = ['seeker', 'recruiter'] as const;
export type RoleInscription = (typeof ROLES_INSCRIPTION)[number];

/** Displayable labels, the technical code stays in the database. */
export const LIBELLES_ROLE: Record<Role, string> = {
  seeker: 'Candidat',
  recruiter: 'Recruteur',
  admin: 'Administrateur',
};

/*
 * Where each role lands: its own home screen. Used both by the header and by
 * the router guard, which sends a user back here when they ask for a page
 * reserved to another role. No admin home exists yet, so that role still points
 * at the screen it actually works from.
 */
export const ROUTE_ESPACE: Record<Role, string> = {
  seeker: 'candidate-dashboard',
  recruiter: 'recruiter-dashboard',
  admin: 'admin-questions',
};
