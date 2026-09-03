import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type { UpdateProfilInput } from './ProfilSchema.js'

type SqlValue = string | number | boolean | null

export interface Profil extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  location: string | null
  targetSector: string | null
  role: 'seeker'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export class ProfilRepository {
  async findById(
    id: string,
  ): Promise<Profil | null> {
    const [rows] = await db.query<Profil[]>(
      `
      SELECT
        s.id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.mail AS mail,
        u.phone AS phone,
        s.location AS location,
        s.target_sector AS targetSector,
        u.role AS role,
        u.status AS status,
        s.created_at AS createdAt,
        s.updated_at AS updatedAt
      FROM seeker s
      INNER JOIN app_user u
        ON u.uuid = s.id
      WHERE s.id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async update(
    id: string,
    data: UpdateProfilInput,
  ): Promise<void> {
    const userFields: string[] = []
    const userValues: SqlValue[] = []

    const seekerFields: string[] = []
    const seekerValues: SqlValue[] = []

    if (data.firstName !== undefined) {
      userFields.push('first_name = ?')
      userValues.push(data.firstName)
    }

    if (data.lastName !== undefined) {
      userFields.push('last_name = ?')
      userValues.push(data.lastName)
    }

    if (data.phone !== undefined) {
      userFields.push('phone = ?')
      userValues.push(data.phone)
    }

    if (data.location !== undefined) {
      seekerFields.push('location = ?')
      seekerValues.push(data.location)
    }

    if (data.targetSector !== undefined) {
      seekerFields.push('target_sector = ?')
      seekerValues.push(data.targetSector)
    }

    if (userFields.length > 0) {
      userValues.push(id)

      await db.execute(
        `
        UPDATE app_user
        SET ${userFields.join(', ')}
        WHERE uuid = ?
          AND role = 'seeker'
        `,
        userValues,
      )
    }

    if (seekerFields.length > 0) {
      seekerValues.push(id)

      await db.execute(
        `
        UPDATE seeker
        SET ${seekerFields.join(', ')}
        WHERE id = ?
        `,
        seekerValues,
      )
    }
  }
}