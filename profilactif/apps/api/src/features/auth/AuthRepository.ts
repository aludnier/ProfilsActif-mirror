/**
 * Seul fichier du slice qui écrit du SQL. Propriétaire de la table `utilisateur`.
 *
 * Renvoie les lignes telles qu'elles sont en base (snake_case) : c'est le
 * Service qui traduit vers le vocabulaire de l'API.
 */

import type { RowDataPacket } from 'mysql2'
import { execute, queryOne } from '../../infrastructure/db.client.js'
import type { Role, RoleInscription } from '../../shared/roles.js'

export type LigneUtilisateur = RowDataPacket & {
  id: number
  prenom: string
  nom: string
  email: string
  mot_de_passe_hash: string
  role: Role
  cree_le: string
}

export type LigneUtilisateurPublic = RowDataPacket & {
  id: number
  prenom: string
  nom: string
  email: string
  role: Role
  cree_le: string
}

// Utilisé par la connexion : c'est le seul cas où le hash sort de la base. */
export function trouverParEmail(email: string): Promise<LigneUtilisateur | null> {
  return queryOne<LigneUtilisateur>(
    `SELECT id, prenom, nom, email, mot_de_passe_hash, role, cree_le
       FROM utilisateur
      WHERE email = ?`,
    [email],
  )
}

export function trouverParId(id: number): Promise<LigneUtilisateurPublic | null> {
  return queryOne<LigneUtilisateurPublic>(
    `SELECT id, prenom, nom, email, role, cree_le
       FROM utilisateur
      WHERE id = ?`,
    [id],
  )
}

export async function creer(donnees: {
  prenom: string
  nom: string
  email: string
  motDePasseHash: string
  role: RoleInscription
}): Promise<number> {
  const resultat = await execute(
    `INSERT INTO utilisateur (prenom, nom, email, mot_de_passe_hash, role)
     VALUES (?, ?, ?, ?, ?)`,
    [donnees.prenom, donnees.nom, donnees.email, donnees.motDePasseHash, donnees.role],
  )
  return resultat.insertId
}
