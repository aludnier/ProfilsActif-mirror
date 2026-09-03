import 'dotenv/config'
import mysql from 'mysql2/promise'
import type { ResultSetHeader, RowDataPacket } from 'mysql2'

export const db = mysql.createPool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'profilsactif',
  user: process.env.DB_USER ?? 'profilsactif',
  password: process.env.DB_PASSWORD ?? '',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT ?? 10),
  queueLimit: 0,
})

export async function testDatabaseConnection(): Promise<void> {
  let connection: mysql.PoolConnection | undefined

  try {
    connection = await db.getConnection()
    await connection.ping()

    console.log('Base de donnée connecté avec succès')
  } catch (error) {
    console.error('Connexion a la Base de donnée échouée')
    console.error(error)

    throw error
  } finally {
    connection?.release()
  }
}

// Utilisés par les slices écrits en style fonctionnel (auth). Les slices en
// style classe (skill, video...) utilisent `db` directement, c'est équivalent.

// Types acceptés comme paramètre lié (`?`) d'une requête préparée.
export type ParamSql = string | number | boolean | Date | null

// SELECT renvoyant plusieurs lignes.
export async function query<T extends RowDataPacket>(
  sql: string,
  params: ParamSql[] = [],
): Promise<T[]> {
  const [rows] = await db.query<T[]>(sql, params)
  return rows
}

// SELECT dont on n'attend qu'une ligne : `null` plutôt qu'un tableau vide.

export async function queryOne<T extends RowDataPacket>(
  sql: string,
  params: ParamSql[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}

// INSERT / UPDATE / DELETE : renvoie l'en-tête (`insertId`, `affectedRows`).
export async function execute(sql: string, params: ParamSql[] = []): Promise<ResultSetHeader> {
  const [result] = await db.execute<ResultSetHeader>(sql, params)
  return result
}
