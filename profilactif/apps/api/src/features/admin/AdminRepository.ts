import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type {
  ListUsersInput,
  UpdateUserRoleInput,
  UpdateUserStatusInput,
  UpdateUserProfileInput,
} from './AdminSchema.js'

interface CountRow extends RowDataPacket {
  total: number
}

type SqlValue = string | number | boolean | null

export interface AdminUser extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  role: 'seeker' | 'recruiter' | 'admin'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export interface PaginatedUsers {
  data: AdminUser[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export class AdminRepository {
  async findUsers(
    filters: ListUsersInput,
  ): Promise<PaginatedUsers> {
    const {
      page,
      limit,
      search,
      role,
      status,
    } = filters

    const offset = (page - 1) * limit

    const conditions: string[] = []
    const values: SqlValue[] = []

    if (search) {
      conditions.push(`
        (
          u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR u.mail LIKE ?
        )
      `)

      const searchValue = `%${search}%`

      values.push(
        searchValue,
        searchValue,
        searchValue,
      )
    }

    if (role) {
      conditions.push('u.role = ?')
      values.push(role)
    }

    if (status) {
      conditions.push('u.status = ?')
      values.push(status)
    }

    const whereClause =
      conditions.length > 0
        ? `WHERE ${conditions.join(' AND ')}`
        : ''

    const [countRows] = await db.query<CountRow[]>(
      `
      SELECT COUNT(*) AS total
      FROM app_user u
      ${whereClause}
      `,
      values,
    )

    const total = Number(countRows[0]?.total ?? 0)

    const [rows] = await db.query<AdminUser[]>(
      `
      SELECT
        u.uuid AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.mail AS mail,
        u.phone AS phone,
        u.role AS role,
        u.status AS status,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt
      FROM app_user u
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ?
      OFFSET ?
      `,
      [...values, limit, offset],
    )

    return {
      data: rows,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findUserById(
    id: string,
  ): Promise<AdminUser | null> {
    const [rows] = await db.query<AdminUser[]>(
      `
      SELECT
        u.uuid AS id,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.mail AS mail,
        u.phone AS phone,
        u.role AS role,
        u.status AS status,
        u.created_at AS createdAt,
        u.updated_at AS updatedAt
      FROM app_user u
      WHERE u.uuid = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }


  async updateUserProfile(id: string, data: UpdateUserProfileInput): Promise<void> {
    const fields: string[] = []
    const values: SqlValue[] = []
    if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName) }
    if (data.lastName !== undefined) { fields.push('last_name = ?'); values.push(data.lastName) }
    if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone) }
    if (data.mail !== undefined) { fields.push('mail = ?'); values.push(data.mail) }
    if (fields.length === 0) return
    values.push(id)
    await db.execute('UPDATE app_user SET ' + fields.join(', ') + ' WHERE uuid = ?', values)
  }

  async updateUserStatus(
    id: string,
    data: UpdateUserStatusInput,
  ): Promise<void> {
    await db.execute(
      `
      UPDATE app_user
      SET status = ?
      WHERE uuid = ?
      `,
      [data.status, id],
    )
  }

  async updateUserRole(id: string, data: UpdateUserRoleInput): Promise<void> {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()
      await connection.execute('UPDATE app_user SET role = ? WHERE uuid = ?', [data.role, id])
      if (data.role === 'seeker') {
        await connection.execute("INSERT INTO seeker (id, location) VALUES (?, 'Non renseigné') ON DUPLICATE KEY UPDATE id = id", [id])
      }
      if (data.role === 'recruiter') {
        await connection.execute('INSERT INTO recruiter (id) VALUES (?) ON DUPLICATE KEY UPDATE id = id', [id])
      }
      await connection.commit()
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
  }
  async deleteUser(id: string): Promise<void> {
    await db.execute('DELETE FROM app_user WHERE uuid = ?', [id])
  }
}
