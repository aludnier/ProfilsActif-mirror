import 'dotenv/config'
import mysql from 'mysql2/promise'

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