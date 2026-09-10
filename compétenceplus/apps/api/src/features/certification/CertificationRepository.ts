import { randomUUID } from 'node:crypto'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'
import { db } from '../../infrastructure/db.client.js'
import type { CreateAttemptInput, CreateQuestionnaireVersionInput, UpdateAttemptInput } from './CertificationSchema.js'

export interface QuestionnaireVersion extends RowDataPacket {
  id: string
  questionnaireId: string
  code: string
  title: string
  version: number
  status: 'draft' | 'published' | 'archived'
  content: Record<string, unknown>
  createdBy: string | null
  createdAt: Date
  publishedAt: Date | null
}

export interface QuestionnaireAttempt extends RowDataPacket {
  id: string
  questionnaireVersionId: string
  seekerId: string
  status: 'in_progress' | 'submitted' | 'abandoned'
  answers: Record<string, unknown>
  score: number | null
  startedAt: Date
  submittedAt: Date | null
  updatedAt: Date
}

export interface QuestionAttemp extends RowDataPacket {
  id: string
  question: string
  responses: string[]
  weight: number
  type: 'single' | 'multiple'
}

function parseJson<T>(value: T | string): T {
  return typeof value === 'string' ? JSON.parse(value) as T : value
}

const versionSelect = `
  SELECT v.id, v.questionnaire_id AS questionnaireId, q.code, q.title,
    v.version, v.status, v.content, v.created_by AS createdBy,
    v.created_at AS createdAt, v.published_at AS publishedAt
  FROM questionnaire_version v JOIN questionnaire q ON q.id = v.questionnaire_id
`

export class CertificationRepository {
  async getPublished(): Promise<QuestionnaireVersion | null> {
    const [rows] = await db.query<QuestionnaireVersion[]>(
      `${versionSelect} WHERE v.status = 'published' ORDER BY v.published_at DESC LIMIT 1`,
    )
    const row = rows[0]
    return row ? { ...row, content: parseJson(row.content) } : null
  }

  async getVersion(id: string): Promise<QuestionnaireVersion | null> {
    const [rows] = await db.query<QuestionnaireVersion[]>(
      `${versionSelect} WHERE v.id = ?`, [id],
    )
    const row = rows[0]
    return row ? { ...row, content: parseJson(row.content) } : null
  }

  async getDraft(): Promise<QuestionnaireVersion | null> {
    const [rows] = await db.query<QuestionnaireVersion[]>(
      `${versionSelect} WHERE v.status = 'draft' ORDER BY v.published_at DESC LIMIT 1`,
    )
    if (rows.length <= 0) {
      return null
    }
    const row = rows[0]
    return row ? { ...row, content: parseJson(row.content) } : null
  }

  /* `createdBy` nullable : la colonne l'est, et un seed n'a pas d'auteur humain. */
  async createVersion(data: CreateQuestionnaireVersionInput, createdBy: string | null): Promise<QuestionnaireVersion> {
    const connection = await db.getConnection()
    const newQuestionnaireId = randomUUID()
    const versionId = randomUUID()
    try {
      await connection.beginTransaction()
      const [existing] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM questionnaire WHERE code = ? LIMIT 1', [data.code],
      )
      const questionnaireId = existing[0]?.id ?? newQuestionnaireId
      if (!existing[0]) {
        await connection.execute(
          'INSERT INTO questionnaire (id, code, title, created_by) VALUES (?, ?, ?, ?)',
          [questionnaireId, data.code, data.title, createdBy],
        )
      } else {
        await connection.execute(
          'UPDATE questionnaire SET title = ? WHERE id = ?', [data.title, questionnaireId],
        )
      }
      const [latest] = await connection.query<RowDataPacket[]>(
        'SELECT COALESCE(MAX(version), 0) AS version FROM questionnaire_version WHERE questionnaire_id = ?',
        [questionnaireId],
      )
      const version = Number(latest[0]?.version ?? 0) + 1
      await connection.execute(
        'INSERT INTO questionnaire_version (id, questionnaire_id, version, content, created_by) VALUES (?, ?, ?, ?, ?)',
        [versionId, questionnaireId, version, JSON.stringify(data.content), createdBy],
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
    return (await this.getVersion(versionId)) as QuestionnaireVersion
  }

  async publishVersion(id: string): Promise<QuestionnaireVersion | null> {
    const version = await this.getVersion(id)
    if (!version) return null
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE questionnaire_version SET status = 'archived' WHERE questionnaire_id = ? AND status = 'published'",
        [version.questionnaireId],
      )
      await connection.execute(
        "UPDATE questionnaire_version SET status = 'published', published_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
    return this.getVersion(id)
  }

  async saveDraft(id: string): Promise<QuestionnaireVersion | null> {
    const version = await this.getVersion(id)
    if (!version) return null
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE questionnaire_version SET status = 'archived' WHERE  status = 'draft'",
      )
      await connection.execute(
        "UPDATE questionnaire_version SET status = 'draft', published_at = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }
    return this.getVersion(id)
  }

  /*
   * Starting a test closes the drafts left behind. Without this, every restart
   * added an `in_progress` row and `getCurrentAttempt` kept offering to resume
   * a test the candidate had already abandoned — even after passing.
   */
  async createAttempt(data: CreateAttemptInput, seekerId: string): Promise<QuestionnaireAttempt> {
    const id = randomUUID()
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE questionnaire_attempt SET status = 'abandoned' WHERE seeker_id = ? AND status = 'in_progress'",
        [seekerId],
      )
      await connection.execute(
        'INSERT INTO questionnaire_attempt (id, questionnaire_version_id, seeker_id, answers) VALUES (?, ?, ?, ?)',
        [id, data.questionnaireVersionId, seekerId, JSON.stringify(data.answers)],
      )
      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return (await this.getAttempt(id, seekerId)) as QuestionnaireAttempt
  }

  /** Last submitted attempt: drives the retake delay and the candidate's status. */
  async getLastSubmittedAttempt(seekerId: string): Promise<QuestionnaireAttempt | null> {
    const [rows] = await db.query<QuestionnaireAttempt[]>(
      `SELECT id, questionnaire_version_id AS questionnaireVersionId, seeker_id AS seekerId,
        status, answers, score, started_at AS startedAt, submitted_at AS submittedAt, updated_at AS updatedAt
       FROM questionnaire_attempt
       WHERE seeker_id = ? AND status = 'submitted'
       ORDER BY submitted_at DESC
       LIMIT 1`,
      [seekerId],
    )
    const row = rows[0]
    return row ? { ...row, answers: parseJson(row.answers) } : null
  }

  async getAttempt(id: string, seekerId: string): Promise<QuestionnaireAttempt | null> {
    const [rows] = await db.query<QuestionnaireAttempt[]>(
      `SELECT id, questionnaire_version_id AS questionnaireVersionId, seeker_id AS seekerId,
        status, answers, score, started_at AS startedAt, submitted_at AS submittedAt, updated_at AS updatedAt
       FROM questionnaire_attempt WHERE id = ? AND seeker_id = ?`,
      [id, seekerId],
    )
    const row = rows[0]
    return row ? { ...row, answers: parseJson(row.answers) } : null
  }

  /* Tentative en cours du candidat, indépendamment de l'appareil : la reprise ne
     peut pas reposer sur le seul localStorage du navigateur. */
  async getCurrentAttempt(seekerId: string): Promise<QuestionnaireAttempt | null> {
    const [rows] = await db.query<QuestionnaireAttempt[]>(
      `SELECT id, questionnaire_version_id AS questionnaireVersionId, seeker_id AS seekerId,
        status, answers, score, started_at AS startedAt, submitted_at AS submittedAt, updated_at AS updatedAt
       FROM questionnaire_attempt
       WHERE seeker_id = ? AND status = 'in_progress'
       ORDER BY updated_at DESC
       LIMIT 1`,
      [seekerId],
    )
    const row = rows[0]
    return row ? { ...row, answers: parseJson(row.answers) } : null
  }

  async submitAttempt(
    id: string,
    seekerId: string,
    answers: Record<string, unknown>,
    score: number,
  ): Promise<QuestionnaireAttempt | null> {
    const connection = await db.getConnection()
    try {
      await connection.beginTransaction()

      const [res] = await connection.execute<ResultSetHeader>(
        `UPDATE questionnaire_attempt
           SET answers = ?, score = ?, status = 'submitted', submitted_at = CURRENT_TIMESTAMP
         WHERE id = ? AND seeker_id = ? AND status <> 'submitted'`,
        [JSON.stringify(answers), score, id, seekerId],
      )

      if (res.affectedRows === 0) {
        await connection.rollback()
        return null
      }

      await connection.execute('UPDATE seeker SET certification_rate = ? WHERE id = ?', [
        Math.round(score),
        seekerId,
      ])

      await connection.commit()
    } catch (error) {
      await connection.rollback()
      throw error
    } finally {
      connection.release()
    }

    return this.getAttempt(id, seekerId)
  }

  async updateAttempt(id: string, seekerId: string, data: UpdateAttemptInput): Promise<QuestionnaireAttempt | null> {
    const fields = ['answers = ?']
    const values: Array<string | number | null> = [JSON.stringify(data.answers)]
    if (data.status !== undefined) {
      fields.push('status = ?')
      values.push(data.status)
      if (data.status === 'submitted') fields.push('submitted_at = CURRENT_TIMESTAMP')
    }
    if (data.score !== undefined) {
      fields.push('score = ?')
      values.push(data.score)
    }
    values.push(id, seekerId)
    await db.execute(
      `UPDATE questionnaire_attempt SET ${fields.join(', ')} WHERE id = ? AND seeker_id = ?`,
      values,
    )
    return this.getAttempt(id, seekerId)
  }

  async GetQuestion(id: string): Promise<QuestionAttemp | null> {
    const [rows] = await db.query<QuestionAttemp[]>(
      `SELECT id, question, responses, question_weight, type FROM certification
        WHERE id = ?`,
      [id]
    )

    const row = rows[0]
    return row ? { ...row, responses: parseJson(row.responses) } : null
  }


  async CreateQuestion(question: string, response: string[], weight: number, type: string): Promise<QuestionAttemp> {
    const id = randomUUID();

    await db.execute(
      'INSERT INTO certification (id, question, responses, question_weight, type) VALUES (?, ?, ?, ?, ?)',
      [id, question, JSON.stringify(response), weight, type]
    );

    return (await this.GetQuestion(id)) as QuestionAttemp
  }
}
