import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type { UpdateRecruiterInput } from './RecruiterSchema.js'

export interface Recruiter extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  role: 'recruiter'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

type SqlValue = string | number | boolean | null

export class RecruiterRepository {
  async findById(id: string): Promise<Recruiter | null> {
    const [rows] = await db.query<Recruiter[]>(
      `
      SELECT
        r.id AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.mail AS mail,
        u.phone AS phone,
        u.role AS role,
        u.status AS status,
        r.created_at AS createdAt,
        r.updated_at AS updatedAt
      FROM recruiter r
      INNER JOIN app_user u
        ON u.uuid = r.id
      WHERE r.id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async update(
    id: string,
    data: UpdateRecruiterInput,
  ): Promise<void> {
    const fields: string[] = []
    const values: SqlValue[] = []

    if (data.firstName !== undefined) {
      fields.push('first_name = ?')
      values.push(data.firstName)
    }

    if (data.lastName !== undefined) {
      fields.push('last_name = ?')
      values.push(data.lastName)
    }

    if (data.phone !== undefined) {
      fields.push('phone = ?')
      values.push(data.phone)
    }

    if (fields.length === 0) {
      return
    }

    values.push(id)

    await db.execute(
      `
      UPDATE app_user
      SET ${fields.join(', ')}
      WHERE uuid = ?
        AND role = 'recruiter'
      `,
      values,
    )
  }
}
