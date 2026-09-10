import { randomUUID } from 'node:crypto'
import type { RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type {CreateVideoInput, UpdateVideoInput} from './VideoSchema.js'

export interface Video extends RowDataPacket {
  id: string
  seekerId: string
  url: string
  title: string | null
  description: string | null
  status: 'pending' | 'approved' | 'rejected'
  moderatedBy: string | null
  moderatedAt: Date | null
  moderationReason: string | null
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
        description,
        status,
        moderated_by AS moderatedBy,
        moderated_at AS moderatedAt,
        moderation_reason AS moderationReason,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM video
      WHERE id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findBySeekerId(seekerId: string, includeUnpublished = false): Promise<Video[]> {
    const [rows] = await db.query<Video[]>(
      `
      SELECT
        id,
        seeker_id AS seekerId,
        url,
        title,
        description,
        status,
        moderated_by AS moderatedBy,
        moderated_at AS moderatedAt,
        moderation_reason AS moderationReason,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM video
      WHERE seeker_id = ?
        ${includeUnpublished ? '' : "AND status = 'approved'"}
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
        title,
        description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        id,
        data.seekerId,
        data.url,
        data.title ?? null,
        data.description ?? null,
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

    if (data.description !== undefined) {
      fields.push('description = ?')
      values.push(data.description)
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

  async findPending(): Promise<Video[]> {
    const [rows] = await db.query<Video[]>(
      `SELECT v.id, v.seeker_id AS seekerId, v.url, v.title, v.description, v.status, v.moderated_by AS moderatedBy, v.moderated_at AS moderatedAt, v.moderation_reason AS moderationReason, v.created_at AS createdAt, v.updated_at AS updatedAt FROM video v INNER JOIN app_user u ON u.uuid = v.seeker_id WHERE v.status = 'pending' ORDER BY v.created_at ASC`,
    )
    return rows
  }

  async updateStatus(id: string, status: 'approved' | 'rejected', adminId: string, reason: string | null): Promise<Video | null> {
    await db.execute(
      `UPDATE video SET status = ?, moderated_by = ?, moderated_at = CURRENT_TIMESTAMP, moderation_reason = ? WHERE id = ?`,
      [status, adminId, reason, id],
    )
    return this.findById(id)
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

  // Serving a file needs the row behind it: status and owner drive access.
  async findByUrl(url: string): Promise<Video | null> {
    const [rows] = await db.query<Video[]>(
      `SELECT id, seeker_id AS seekerId, url, title, description, status,
              moderated_by AS moderatedBy, moderated_at AS moderatedAt,
              moderation_reason AS moderationReason,
              created_at AS createdAt, updated_at AS updatedAt
         FROM video WHERE url = ? LIMIT 1`,
      [url],
    )

    return rows[0] ?? null
  }
}
