import { randomUUID } from 'node:crypto'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type { CreateFavoriteInput } from './FavoriteSchema.js'

export interface Favorite extends RowDataPacket {
  id: string
  recruiterId: string
  seekerId: string
  createdAt: Date
}

export class FavoriteRepository {
  async findById(id: string): Promise<Favorite | null> {
    const [rows] = await db.query<Favorite[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        created_at AS createdAt
      FROM favorite
      WHERE id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findByRecruiter(
    recruiterId: string,
  ): Promise<Favorite[]> {
    const [rows] = await db.query<Favorite[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        created_at AS createdAt
      FROM favorite
      WHERE recruiter_id = ?
      ORDER BY created_at DESC
      `,
      [recruiterId],
    )

    return rows
  }

  async findByRecruiterAndSeeker(
    recruiterId: string,
    seekerId: string,
  ): Promise<Favorite | null> {
    const [rows] = await db.query<Favorite[]>(
      `
      SELECT
        id,
        recruiter_id AS recruiterId,
        seeker_id AS seekerId,
        created_at AS createdAt
      FROM favorite
      WHERE recruiter_id = ?
        AND seeker_id = ?
      `,
      [recruiterId, seekerId],
    )

    return rows[0] ?? null
  }

  async create(data: CreateFavoriteInput): Promise<Favorite> {
    const id = randomUUID()

    await db.execute(
      `
      INSERT INTO favorite (
        id,
        recruiter_id,
        seeker_id
      )
      VALUES (?, ?, ?)
      `,
      [id, data.recruiterId, data.seekerId],
    )

    const favorite = await this.findById(id)

    if (!favorite) {
      throw new Error('Favorite créé mais introuvable')
    }

    return favorite
  }

  async delete(id: string): Promise<void> {
    await db.execute(
      `
      DELETE FROM favorite
      WHERE id = ?
      `,
      [id],
    )
  }
}