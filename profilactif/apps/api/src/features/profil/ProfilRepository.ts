import type { RowDataPacket } from 'mysql2'

import { db } from '../../infrastructure/db.client.js'

import type { UpdateCompetencesInput, UpdateProfilInput } from './ProfilSchema.js'

type SqlValue = string | number | boolean | null

export interface Profil extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  mail: string
  phone: string | null
  age: number | null
  location: string | null
  targetSector: string | null
  employmentType: string | null
  bio: string | null
  workMode: string | null
  experienceYears: number | null
  certificationRate: number
  role: 'seeker'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export class ProfilRepository {
  async findAll(): Promise<Profil[]> {
    const [rows] = await db.query<Profil[]>(`
      SELECT s.id AS id, u.first_name AS firstName, u.last_name AS lastName,
        u.mail AS mail, u.phone AS phone, u.age AS age,
        s.location AS location, s.target_sector AS targetSector, s.employment_type AS employmentType, s.work_mode AS workMode, s.experience_years AS experienceYears, s.bio AS bio,
        s.certification_rate AS certificationRate,
        u.role AS role, u.status AS status,
        s.created_at AS createdAt, s.updated_at AS updatedAt
      FROM seeker s INNER JOIN app_user u ON u.uuid = s.id
      WHERE u.role = 'seeker' AND u.status = 'active'
      ORDER BY s.created_at DESC
    `)
    return rows
  }


  async findById(id: string): Promise<Profil | null> {
    const [rows] = await db.query<Profil[]>(
      `
        SELECT
          s.id AS id,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.mail AS mail,
          u.phone AS phone,
          u.age AS age,
          s.location AS location,
          s.target_sector AS targetSector,
          s.employment_type AS employmentType,
          s.work_mode AS workMode,
          s.experience_years AS experienceYears,
          s.bio AS bio,
          s.certification_rate AS certificationRate,
          u.role AS role,
          u.status AS status,
          s.created_at AS createdAt,
          s.updated_at AS updatedAt
        FROM seeker s
        INNER JOIN app_user u
          ON u.uuid = s.id
        WHERE s.id = ?
          AND u.role = 'seeker'
      `,
      [id],
    )

    return rows[0] ?? null
  }

  async findCompetences(id: string): Promise<string[]> {
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT s.name FROM seeker_skill ss INNER JOIN skill s ON s.id = ss.skill_id WHERE ss.seeker_id = ? ORDER BY s.name ASC",
      [id],
    )
    return rows.map((row) => String(row.name))
  }

  async replaceCompetences(id: string, data: UpdateCompetencesInput): Promise<void> {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()
      await connection.execute("DELETE FROM seeker_skill WHERE seeker_id = ?", [id])

      for (const name of [...new Set(data.competences.map((value) => value.trim()))]) {
        await connection.execute("INSERT IGNORE INTO skill (name) VALUES (?)", [name])
        const [rows] = await connection.query<RowDataPacket[]>(
          "SELECT id FROM skill WHERE name = ?",
          [name],
        )
        const skillId = rows[0]?.id
        if (skillId) {
          await connection.execute(
            "INSERT INTO seeker_skill (seeker_id, skill_id) VALUES (?, ?)",
            [id, skillId],
          )
        }
      }

      await connection.commit()
    } catch (err) {
      await connection.rollback()
      throw err
    } finally {
      connection.release()
    }
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

    if (data.age !== undefined) {
      userFields.push('age = ?')
      userValues.push(data.age)
    }

    if (data.location !== undefined) {
      seekerFields.push('location = ?')
      seekerValues.push(data.location)
    }

    if (data.targetSector !== undefined) {
      seekerFields.push('target_sector = ?')
      seekerValues.push(data.targetSector)
    }

    if (data.employmentType !== undefined) {
      seekerFields.push('employment_type = ?')
      seekerValues.push(data.employmentType)
    }

    if (data.workMode !== undefined) {
      seekerFields.push('work_mode = ?')
      seekerValues.push(data.workMode)
    }

    if (data.experienceYears !== undefined) {
      seekerFields.push('experience_years = ?')
      seekerValues.push(data.experienceYears)
    }

    if (data.bio !== undefined) {
      seekerFields.push('bio = ?')
      seekerValues.push(data.bio)
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