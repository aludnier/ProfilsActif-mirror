/**
 * Seul fichier du slice qui écrit du SQL. Propriétaire de la table `app_user`.
 *
 * Les colonnes SQL sont en snake_case ; la requête les traduit en camelCase
 * pour le reste du slice.
 */

import type { RowDataPacket } from 'mysql2'

import { db } from '../../infrastructure/db.client.js'
import type { Role, SignupRole } from '../../shared/roles.js'

export interface AppUserRow extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  passwordHash: string
  role: Role
  status: 'active' | 'suspended' | 'deleted'
  createdAt: string
}

const SELECT_COLUMNS = `
  uuid          AS id,
  first_name    AS firstName,
  last_name     AS lastName,
  mail,
  phone,
  password_hash AS passwordHash,
  role,
  status,
  created_at    AS createdAt
`

export class AuthRepository {
  async findByMail(mail: string): Promise<AppUserRow | null> {
    const [rows] = await db.query<AppUserRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM app_user WHERE mail = ?`,
      [mail],
    )
    return rows[0] ?? null
  }

  async findById(id: string): Promise<AppUserRow | null> {
    const [rows] = await db.query<AppUserRow[]>(
      `SELECT ${SELECT_COLUMNS} FROM app_user WHERE uuid = ?`,
      [id],
    )
    return rows[0] ?? null
  }

  /**
   * L'UUID est fourni par le service (généré côté Node) : la clé primaire
   * n'est pas auto-incrémentée, on ne peut pas se reposer sur `insertId`.
   */
  async create(data: {
    id: string
    firstName: string
    lastName: string
    mail: string
    phone: string | null
    passwordHash: string
    role: SignupRole
    location?: string
    targetSector?: string | null
  }): Promise<void> {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      await connection.execute(
        `INSERT INTO app_user (uuid, first_name, last_name, mail, phone, password_hash, role)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.id, data.firstName, data.lastName, data.mail, data.phone, data.passwordHash, data.role],
      )

      if (data.role === 'seeker') {
        await connection.execute(
          `INSERT INTO seeker (id, location, target_sector)
           VALUES (?, ?, ?)`,
          [data.id, data.location ?? 'Non renseigné', data.targetSector ?? null],
        )
      }

      if (data.role === 'recruiter') {
        await connection.execute(
          `INSERT INTO recruiter (id)
           VALUES (?)`,
          [data.id],
        )
      }

      await connection.commit()
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  }
}
