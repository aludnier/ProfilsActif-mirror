import { randomUUID } from 'node:crypto'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type {CreateVideoInput, UpdateVideoInput} from './VideoSchema.js'

export interface Video extends RowDataPacket {
  id: string
  seekerId: string
  url: string
  title: string | null
  createdAt: Date
  updatedAt: Date
}

type SqlValue = string | number | boolean | null

export class VideoRepository {
  async findById(id: string): Promise<Video | null> {
    const [rows] = await db.query<Video[]>(
      `
      SELECT
        id,
        seeker_id AS seekerId,
        url,
        title,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM video
      WHERE id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findBySeekerId(seekerId: string): Promise<Video[]> {
    const [rows] = await db.query<Video[]>(
      `
      SELECT
        id,
        seeker_id AS seekerId,
        url,
        title,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM video
      WHERE seeker_id = ?
      ORDER BY created_at DESC
      `,
      [seekerId],
    )

    return rows
  }

  async create(data: CreateVideoInput): Promise<Video> {
    const id = randomUUID()

    await db.execute(
      `
      INSERT INTO video (
        id,
        seeker_id,
        url,
        title
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        id,
        data.seekerId,
        data.url,
        data.title ?? null,
      ],
    )

    const video = await this.findById(id)

    if (!video) {
      throw new Error('Vidéo créée mais introuvable')
    }

    return video
  }

  async update(
    id: string,
    data: UpdateVideoInput,
  ): Promise<void> {
    const fields: string[] = []
    const values: SqlValue[] = []

    if (data.url !== undefined) {
      fields.push('url = ?')
      values.push(data.url)
    }

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }

    if (fields.length === 0) {
      return
    }

    values.push(id)

    await db.execute(
      `
      UPDATE video
      SET ${fields.join(', ')}
      WHERE id = ?
      `,
      values,
    )
  }

  async delete(id: string): Promise<void> {
    await db.execute(
      `
      DELETE FROM video
      WHERE id = ?
      `,
      [id],
    )
  }
}