import type { ResultSetHeader, RowDataPacket } from 'mysql2'

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
  contractStartDate: string | null
  contractEndDate: string | null
  bio: string | null
  workMode: string | null
  experienceYears: number | null
  certificationRate: number
  hasVideo: boolean
  catalogVisible: boolean
  /* `null` quand le candidat n'a jamais envoyé de photo. */
  photoStatus: 'pending' | 'approved' | 'rejected' | null
  /* Approved video only: the grids must never preview a pending one. */
  videoUrl: string | null
  role: 'seeker'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
  competences?: string[]
  competencesRaw?: string
}

/*
 * La liste est servie par une route publique : elle ne porte ni le mail ni le
 * téléphone. Champs écrits un par un plutôt qu'avec `Omit<Profil, …>` : `Profil`
 * hérite de l'index de `RowDataPacket`, sur lequel `Omit` ne retire rien.
 */
export interface ProfilListe extends RowDataPacket {
  id: string
  firstName: string
  lastName: string
  age: number | null
  location: string | null
  targetSector: string | null
  employmentType: string | null
  contractStartDate: string | null
  contractEndDate: string | null
  bio: string | null
  workMode: string | null
  experienceYears: number | null
  certificationRate: number
  hasVideo: boolean
  catalogVisible: boolean
  /* `null` quand le candidat n'a jamais envoyé de photo. */
  photoStatus: 'pending' | 'approved' | 'rejected' | null
  role: 'seeker'
  status: 'active' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export interface PhotoEnAttente extends RowDataPacket {
  seekerId: string
  firstName: string
  lastName: string
  path: string
  updatedAt: Date
}

export interface PhotoProfil extends RowDataPacket {
  path: string | null
  status: 'pending' | 'approved' | 'rejected' | null
}

export interface ConsultationProfil extends RowDataPacket {
  id: string
  organization: string
  viewedAt: Date
}

export class ProfilRepository {
  async findAll(): Promise<ProfilListe[]> {
    const [rows] = await db.query<ProfilListe[]>(`
      SELECT s.id AS id, u.first_name AS firstName, u.last_name AS lastName,
        u.age AS age,
        s.location AS location, s.target_sector AS targetSector, s.employment_type AS employmentType, s.contract_start_date AS contractStartDate, s.contract_end_date AS contractEndDate, s.work_mode AS workMode, s.experience_years AS experienceYears, s.bio AS bio,
        s.certification_rate AS certificationRate, EXISTS (SELECT 1 FROM video v WHERE v.seeker_id = s.id AND v.status = \'approved\') AS hasVideo, s.catalog_visible AS catalogVisible, s.photo_status AS photoStatus,
        u.role AS role, u.status AS status,
        s.created_at AS createdAt, s.updated_at AS updatedAt,
        (SELECT v.url FROM video v
          WHERE v.seeker_id = s.id AND v.status = 'approved'
          ORDER BY v.created_at DESC LIMIT 1) AS videoUrl
      FROM seeker s INNER JOIN app_user u ON u.uuid = s.id
      WHERE u.role = 'seeker' AND u.status = 'active' AND s.catalog_visible = 1
      ORDER BY s.updated_at DESC, s.id ASC
    `)
    return rows
  }



  async findPage(filters: {
    page: number
    limit: number
    secteur?: string
    localisation?: string
    competences?: string[]
    niveau?: string
    types?: string[]
    modalites?: string[]
    certification?: string
    contratDu?: string
    contratAu?: string
  }): Promise<{ data: Profil[]; page: number; limit: number; total: number; totalPages: number }> {
    const conditions = ["u.role = 'seeker'", "u.status = 'active'", "s.catalog_visible = 1"]
    const values: SqlValue[] = []

    if (filters.secteur) {
      conditions.push('s.target_sector LIKE ?')
      values.push('%' + filters.secteur + '%')
    }
    if (filters.localisation) {
      conditions.push('s.location LIKE ?')
      values.push('%' + filters.localisation + '%')
    }
    if (filters.competences?.length) {
      conditions.push('EXISTS (SELECT 1 FROM seeker_skill filter_ss INNER JOIN skill filter_skill ON filter_skill.id = filter_ss.skill_id WHERE filter_ss.seeker_id = s.id AND filter_skill.name IN (' + filters.competences.map(() => '?').join(', ') + '))')
      values.push(...filters.competences)
    }
    if (filters.certification === 'certifiee') conditions.push('s.certification_rate > 0')
    if (filters.certification === 'non_certifiee') conditions.push('s.certification_rate = 0')
    if (filters.niveau === 'junior') conditions.push('s.experience_years IS NOT NULL AND s.experience_years <= 2')
    if (filters.niveau === 'confirmed') conditions.push('s.experience_years > 2 AND s.experience_years < 7')
    if (filters.niveau === 'senior') conditions.push('s.experience_years >= 7')
    if (filters.contratDu && filters.contratAu) {
      conditions.push('s.contract_start_date <= ? AND (s.contract_end_date IS NULL OR s.contract_end_date >= ?)')
      values.push(filters.contratAu, filters.contratDu)
    } else if (filters.contratDu) {
      conditions.push('(s.contract_end_date IS NULL OR s.contract_end_date >= ?)')
      values.push(filters.contratDu)
    } else if (filters.contratAu) {
      conditions.push('s.contract_start_date <= ?')
      values.push(filters.contratAu)
    }
    if (filters.types?.length) {
      conditions.push('s.employment_type IN (' + filters.types.map(() => '?').join(', ') + ')')
      values.push(...filters.types)
    }
    if (filters.modalites?.length) {
      conditions.push('s.work_mode IN (' + filters.modalites.map(() => '?').join(', ') + ')')
      values.push(...filters.modalites)
    }

    const where = 'WHERE ' + conditions.join(' AND ')
    const [countRows] = await db.query<RowDataPacket[]>(
      'SELECT COUNT(*) AS total FROM seeker s INNER JOIN app_user u ON u.uuid = s.id ' + where,
      values,
    )
    const total = Number(countRows[0]?.total ?? 0)
    const page = Math.max(1, filters.page)
    const limit = Math.min(50, Math.max(1, filters.limit))
    const offset = (page - 1) * limit
    const sql = 'SELECT s.id AS id, u.first_name AS firstName, u.last_name AS lastName, u.mail AS mail, u.phone AS phone, u.age AS age, s.location AS location, s.target_sector AS targetSector, s.employment_type AS employmentType, s.contract_start_date AS contractStartDate, s.contract_end_date AS contractEndDate, s.work_mode AS workMode, s.experience_years AS experienceYears, s.bio AS bio, s.certification_rate AS certificationRate, EXISTS (SELECT 1 FROM video v WHERE v.seeker_id = s.id AND v.status = \'approved\') AS hasVideo, s.catalog_visible AS catalogVisible, s.photo_status AS photoStatus, u.role AS role, u.status AS status, s.created_at AS createdAt, s.updated_at AS updatedAt, COALESCE((SELECT GROUP_CONCAT(page_skill.name ORDER BY page_skill.name SEPARATOR \'||\') FROM seeker_skill page_ss INNER JOIN skill page_skill ON page_skill.id = page_ss.skill_id WHERE page_ss.seeker_id = s.id), \'\') AS competencesRaw FROM seeker s INNER JOIN app_user u ON u.uuid = s.id ' + where + ' ORDER BY s.updated_at DESC, s.id ASC LIMIT ? OFFSET ?'
    const [rows] = await db.query<Profil[]>(sql, [...values, limit, offset])
    const data = rows.map((row) => ({
      ...row,
      competences: row.competencesRaw ? String(row.competencesRaw).split('||') : [],
    }))
    return { data, page, limit, total, totalPages: Math.ceil(total / limit) }
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
          s.catalog_visible AS catalogVisible,
          s.photo_status AS photoStatus,
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


  async recordConsultation(seekerId: string, recruiterId: string): Promise<void> {
    await db.execute(
      `INSERT INTO profile_view (id, seeker_id, recruiter_id, organization_name)
       SELECT UUID(), ?, r.id,
         COALESCE(NULLIF(r.organization_name, ''), SUBSTRING_INDEX(u.mail, '@', -1))
       FROM recruiter r
       INNER JOIN app_user u ON u.uuid = r.id
       WHERE r.id = ? AND u.role = 'recruiter'`,
      [seekerId, recruiterId],
    )
  }

  async findConsultations(seekerId: string): Promise<ConsultationProfil[]> {
    const [rows] = await db.query<ConsultationProfil[]>(
      `SELECT id, organization_name AS organization, viewed_at AS viewedAt
       FROM profile_view
       WHERE seeker_id = ?
       ORDER BY viewed_at DESC, id DESC`,
      [seekerId],
    )
    return rows
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

    if (data.contractStartDate !== undefined) {
      seekerFields.push('contract_start_date = ?')
      seekerValues.push(data.contractStartDate)
    }
    if (data.contractEndDate !== undefined) {
      seekerFields.push('contract_end_date = ?')
      seekerValues.push(data.contractEndDate)
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

    if (data.catalogVisible !== undefined) {
      seekerFields.push('catalog_visible = ?')
      seekerValues.push(data.catalogVisible ? 1 : 0)
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

  /* --- Photo de profil ---------------------------------------------------
   * Le fichier vit sur le disque, la base ne garde que son nom et son état de
   * modération. Ces colonnes appartiennent à la tranche `profil`, sauf
   * `photo_status` que l'admin fait évoluer (règle de propriété : l'admin
   * possède les colonnes de modération).
   */

  async findPhoto(id: string): Promise<PhotoProfil | null> {
    const [rows] = await db.query<PhotoProfil[]>(
      `SELECT photo_path AS path, photo_status AS status FROM seeker WHERE id = ?`,
      [id],
    )

    return rows[0] ?? null
  }

  /* Toute nouvelle photo repart en attente : une image validée ne doit pas
     pouvoir être remplacée en douce par une autre déjà approuvée. */
  async updatePhoto(id: string, nomFichier: string): Promise<void> {
    await db.execute(
      `UPDATE seeker
         SET photo_path = ?, photo_status = 'pending',
             photo_moderated_by = NULL, photo_moderated_at = NULL,
             photo_moderation_reason = NULL
       WHERE id = ?`,
      [nomFichier, id],
    )
  }

  async clearPhoto(id: string): Promise<void> {
    await db.execute(
      `UPDATE seeker
         SET photo_path = NULL, photo_status = NULL,
             photo_moderated_by = NULL, photo_moderated_at = NULL,
             photo_moderation_reason = NULL
       WHERE id = ?`,
      [id],
    )
  }

  /* Photos en attente, pour l'écran de modération. */
  async findPendingPhotos(): Promise<PhotoEnAttente[]> {
    const [rows] = await db.query<PhotoEnAttente[]>(
      `SELECT s.id AS seekerId, u.first_name AS firstName, u.last_name AS lastName,
              s.photo_path AS path, s.updated_at AS updatedAt
         FROM seeker s
         INNER JOIN app_user u ON u.uuid = s.id
        WHERE s.photo_status = 'pending' AND s.photo_path IS NOT NULL
        ORDER BY s.updated_at ASC`,
    )

    return rows
  }

  async updatePhotoStatus(
    id: string,
    status: 'approved' | 'rejected',
    adminId: string,
    reason: string | null,
  ): Promise<boolean> {
    const [result] = await db.execute<ResultSetHeader>(
      `UPDATE seeker
         SET photo_status = ?, photo_moderated_by = ?,
             photo_moderated_at = CURRENT_TIMESTAMP, photo_moderation_reason = ?
       WHERE id = ? AND photo_path IS NOT NULL`,
      [status, adminId, reason, id],
    )

    return result.affectedRows > 0
  }
}
