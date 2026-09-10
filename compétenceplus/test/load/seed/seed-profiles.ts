import { config as loadEnv } from 'dotenv'
import mysql from 'mysql2/promise'
import type { RowDataPacket } from 'mysql2'
loadEnv({ path: process.env.API_ENV_FILE ?? 'apps/api/.env' })

type PublicUser = { id: string; firstName: string; lastName: string; mail: string }
type AuthResponse = { token: string; user: PublicUser }

const API_URL = process.env.API_URL ?? 'http://localhost:3000'
const PROFILE_COUNT = Number(process.env.PROFILE_COUNT ?? 500)
const VIDEO_COUNT = Number(process.env.VIDEO_COUNT ?? 300)
const SEED_CONCURRENCY = Number(process.env.SEED_CONCURRENCY ?? 1)
const PASSWORD = process.env.SEED_PASSWORD ?? 'LoadTest123!'
const SUPER_ADMIN_MAIL = 'superAdmin@competenceplus.local'
const SUPER_ADMIN_PASSWORD_HASH =
  '$2a$10$RiQm6qc0gNmlrdMkjJ8q4.40U8ev52QXKTbC0e.ScmHVHPbtWixxu'
const RESET_LOAD_DATA = (process.env.RESET_LOAD_DATA ?? 'true') !== 'false'
const VIDEO_URLS = (process.env.VIDEO_URLS ??
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

const prenoms = ['Camille', 'Lucas', 'Marie', 'Thomas', 'Sarah', 'Hugo', 'Emma', 'Nathan']
const noms = ['Martin', 'Bernard', 'Robert', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Roux']
const villes = ['Paris', 'Lyon', 'Nantes', 'Bordeaux', 'Lille', 'Rennes', 'Toulouse', 'Grenoble']
const secteurs = ['Développement web', 'Data & IA', 'Cybersécurité', 'Marketing digital', 'Design UX/UI']
const contrats = ['full_time', 'part_time', 'freelance', 'internship'] as const
const modes = ['on_site', 'hybrid', 'remote'] as const

function valeur<T>(liste: readonly T[], index: number): T {
  return liste[index % liste.length]
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string,
): Promise<T> {
  const response = await fetch(API_URL + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(init.headers ?? {}),
    },
  })

  const text = await response.text()
  let body: unknown = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = text
  }

  if (!response.ok) {
    const code =
      typeof body === 'object' && body !== null && 'code' in body
        ? String((body as { code: unknown }).code)
        : ''
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as { message: unknown }).message)
        : response.statusText
    throw new Error(response.status + ' ' + path + ': ' + code + ' ' + message)
  }

  return body as T
}

async function resetLoadData(): Promise<void> {
  if (!RESET_LOAD_DATA) return

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME ?? "compétenceplus",
    user: process.env.DB_USER ?? "User",
    password: process.env.DB_PASSWORD ?? "",
  })

  try {
    await connection.beginTransaction()
    await connection.execute(
      `
      INSERT INTO app_user
        (uuid, first_name, last_name, mail, password_hash, role, status)
      VALUES
        (UUID(), 'superAdmin', 'Compétences+', ?, ?, 'admin', 'active')
      ON DUPLICATE KEY UPDATE role = 'admin', status = 'active'
      `,
      [SUPER_ADMIN_MAIL, SUPER_ADMIN_PASSWORD_HASH],
    )
    await connection.execute("DELETE FROM app_user WHERE mail <> ?", [SUPER_ADMIN_MAIL])
    const [rows] = await connection.query<(RowDataPacket & { total: number; admin_total: number })[]>(
      "SELECT COUNT(*) AS total, SUM(mail = ?) AS admin_total FROM app_user",
      [SUPER_ADMIN_MAIL],
    )
    if (Number(rows[0]?.total) !== 1 || Number(rows[0]?.admin_total) !== 1) {
      throw new Error("Le nettoyage a échoué : superAdmin doit être le seul compte conservé")
    }
    await connection.commit()
    console.log("Base nettoyée : superAdmin conservé, autres comptes supprimés.")
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    await connection.end()
  }
}
async function signupOrLogin(index: number): Promise<AuthResponse> {
    const numero = String(index + 1).padStart(4, '0')
    const firstName = valeur(prenoms, index)
    const lastName = valeur(noms, index * 3) + ' -' + numero
  const mail = 'load-seeker-' + String(index + 1).padStart(4, '0') + '@test.competenceplus.local'

  try {
    return await request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        firstName,
        lastName,
        mail,
        password: PASSWORD,
        role: 'seeker',
        location: valeur(villes, index),
        targetSector: valeur(secteurs, index),
      }),
    })
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('MAIL_DEJA_UTILISE')) {
      throw error
    }

    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ mail, password: PASSWORD }),
    })
  }
}

async function seedOne(index: number): Promise<AuthResponse> {
  const auth = await signupOrLogin(index)
  await request('/profiles/' + auth.user.id, {
    method: 'PATCH',
    body: JSON.stringify({
      age: 20 + (index % 25),
      employmentType: valeur(contrats, index),
      workMode: valeur(modes, index),
      experienceYears: Number(((index % 12) + 0.5).toFixed(1)),
      bio: 'Profil de test de charge ' + (index + 1) + '.',
    }),
  }, auth.token)

  await request('/profiles/' + auth.user.id + '/competences', {
    method: 'PUT',
    body: JSON.stringify({
      competences: ['Compétence test ' + (index + 1)],
    }),
  }, auth.token)

  return auth
}

async function main(): Promise<void> {
  if (!Number.isInteger(PROFILE_COUNT) || PROFILE_COUNT < 500) {
    throw new Error('PROFILE_COUNT doit être un entier supérieur ou égal à 500')
  }
  if (!Number.isInteger(VIDEO_COUNT) || VIDEO_COUNT < 300 || VIDEO_COUNT > PROFILE_COUNT) {
    throw new Error('VIDEO_COUNT doit être compris entre 300 et PROFILE_COUNT')
  }
  if (!Number.isInteger(SEED_CONCURRENCY) || SEED_CONCURRENCY < 1 || SEED_CONCURRENCY > 10) {
    throw new Error('SEED_CONCURRENCY doit être compris entre 1 et 10')
  }
  if (VIDEO_URLS.length === 0) throw new Error('VIDEO_URLS doit contenir au moins une URL')

  await resetLoadData()
  console.log('Seed API:', API_URL)
  console.log('Profils:', PROFILE_COUNT, '| Vidéos:', VIDEO_COUNT)
  console.log('Concurrence du seed:', SEED_CONCURRENCY)

  const users: AuthResponse[] = []
  for (let start = 0; start < PROFILE_COUNT; start += SEED_CONCURRENCY) {
    const batch = Array.from(
      { length: Math.min(SEED_CONCURRENCY, PROFILE_COUNT - start) },
      (_, offset) => seedOne(start + offset),
    )
    users.push(...(await Promise.all(batch)))
    console.log('Profils traités:', users.length + '/' + PROFILE_COUNT)
  }

  for (let index = 0; index < VIDEO_COUNT; index += 10) {
    const end = Math.min(index + 10, VIDEO_COUNT)
    await Promise.all(
      users.slice(index, end).map((auth, offset) =>
        request('/videos', {
          method: 'POST',
          body: JSON.stringify({
            seekerId: auth.user.id,
            url: valeur(VIDEO_URLS, index + offset),
            title: 'Vidéo de test ' + (index + offset + 1),
            description: 'Vidéo créée par le seed de charge.',
          }),
        }, auth.token),
      ),
    )
    console.log('Vidéos créées:', end + '/' + VIDEO_COUNT)
  }

  console.log('Seed terminé sans insertion SQL directe.')
}

await main()
