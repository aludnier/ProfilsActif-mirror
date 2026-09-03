import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type {
  CreateContactInput,
  UpdateContactInput,
} from './ContactSchema.js'

export interface Contact extends RowDataPacket {
  id: string
  recruiterId: string
  seekerId: string
  message: string | null
  createdAt: Date
}

type SqlValue = string | number | boolean | null

export class ContactRepository {
  async findById(
    id: string,
  ): Promise<Contact | null> {
    const [rows] = await db.query<Contact[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        message,
        created_at AS createdAt
      FROM contact
      WHERE id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findByRecruiter(
    recruiterId: string,
  ): Promise<Contact[]> {
    const [rows] = await db.query<Contact[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        message,
        created_at AS createdAt
      FROM contact
      WHERE recruiter_id = ?
      ORDER BY created_at DESC
      `,
      [recruiterId],
    )

    return rows
  }

  async findBySeeker(
    seekerId: string,
  ): Promise<Contact[]> {
    const [rows] = await db.query<Contact[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        message,
        created_at AS createdAt
      FROM contact
      WHERE seeker_id = ?
      ORDER BY created_at DESC
      `,
      [seekerId],
    )

    return rows
  }

  async create(
    data: CreateContactInput,
  ): Promise<Contact> {
    const [result] = await db.execute(
      `
      INSERT INTO contact (
        recruiter_id,
        seeker_id,
        message
      )
      VALUES (?, ?, ?)
      `,
      [
        data.recruiterId,
        data.seekerId,
        data.message,
      ],
    )

    const insertId = (result as { insertId?: string }).insertId

    if (!insertId) {
      const [rows] = await db.query<Contact[]>(
        `
        SELECT
          id,
          recruiter_id AS recruiterId,
          seeker_id AS seekerId,
          message,
          created_at AS createdAt
        FROM contact
        WHERE recruiter_id = ?
          AND seeker_id = ?
        ORDER BY created_at DESC
        LIMIT 1
        `,
        [
          data.recruiterId,
          data.seekerId,
        ],
      )

      const contact = rows[0]

      if (!contact) {
        throw new Error(
          'Contact créé mais introuvable',
        )
      }

      return contact
    }

    const contact = await this.findById(insertId)

    if (!contact) {
      throw new Error(
        'Contact créé mais introuvable',
      )
    }

    return contact
  }

  async update(
    id: string,
    data: UpdateContactInput,
  ): Promise<void> {
    const values: SqlValue[] = [
      data.message,
      id,
    ]

    await db.execute(
      `
      UPDATE contact
      SET message = ?
      WHERE id = ?
      `,
      values,
    )
  }

  async delete(id: string): Promise<void> {
    await db.execute(
      `
      DELETE FROM contact
      WHERE id = ?
      `,
      [id],
    )
  }
}