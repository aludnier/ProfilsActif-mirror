import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'

export interface Skill extends RowDataPacket {
  id: number
  name: string
}

export class SkillRepository {
  async findAll(): Promise<Skill[]> {
    const [rows] = await db.query<Skill[]>(`
      SELECT
        id,
        name
      FROM skill
      ORDER BY name ASC
    `)

    return rows
  }

  async findById(id: number): Promise<Skill | null> {
    const [rows] = await db.query<Skill[]>(
      `
      SELECT
        id,
        name
      FROM skill
      WHERE id = ?
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findByName(name: string): Promise<Skill | null> {
    const [rows] = await db.query<Skill[]>(
      `
      SELECT
        id,
        name
      FROM skill
      WHERE name = ?
      `,
      [name],
    )

    return rows[0] ?? null
  }

  async create(name: string): Promise<number> {
    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO skill (name)
      VALUES (?)
      `,
      [name],
    )

    return result.insertId
  }

  async update(id: number, name: string): Promise<void> {
    await db.execute(
      `
      UPDATE skill
      SET name = ?
      WHERE id = ?
      `,
      [name, id],
    )
  }

  async delete(id: number): Promise<void> {
    await db.execute(
      `
      DELETE FROM skill
      WHERE id = ?
      `,
      [id],
    )
  }
}