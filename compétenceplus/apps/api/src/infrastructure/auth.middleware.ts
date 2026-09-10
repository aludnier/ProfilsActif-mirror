import { createMiddleware } from 'hono/factory'
import jwt from 'jsonwebtoken'
import type { RowDataPacket } from 'mysql2'

import { db } from './db.client.js'

import { Interdit, NonAuthentifie } from '../shared/errors.js'
import { isRole, type Role } from '../shared/roles.js'

// Ce qu'on met dans le jeton, et ce qu'on récupère en le vérifiant.
export type TokenPayload = {
  id: string
  role: Role
}

// Variable de contexte posée par les middlewares, lue par les routes.
export type AuthVariables = {
  user: TokenPayload
}

const TOKEN_TTL = '7d'

function secret(): string {
  const value = process.env.JWT_SECRET
  if (!value || value.length < 16) {
    throw new Error('JWT_SECRET manquant ou trop court (16 caractères min.) dans apps/api/.env')
  }
  return value
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: TOKEN_TTL })
}

// Contenu du jeton, ou `null` s'il est absent, malformé, mal signé ou expiré.
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, secret())
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      typeof decoded.id === 'string' &&
      isRole(decoded.role)
    ) {
      return { id: decoded.id, role: decoded.role }
    }
    return null
  } catch {
    return null
  }
}

function extractBearer(header: string | undefined): string {
  if (!header) return ''
  const [scheme, value] = header.split(' ')
  return scheme === 'Bearer' && value ? value : ''
}

// Auth obligatoire : 401 si le jeton est absent ou invalide.
export const requireAuth = createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
  const payload = verifyToken(extractBearer(c.req.header('Authorization')))
  if (!payload) {
    throw new NonAuthentifie('Jeton absent ou invalide', 'JETON_INVALIDE')
  }
  const [rows] = await db.query<(RowDataPacket & { status: 'active' | 'suspended' | 'deleted' })[]>('SELECT status FROM app_user WHERE uuid = ?', [payload.id])
  if (rows[0]?.status !== 'active') {
    throw new NonAuthentifie('Ce compte est désactivé', 'COMPTE_DESACTIVE')
  }

  c.set('user', payload)
  await next()
})

// Auth facultative : pose `user` si un jeton valide accompagne la requête,
// laisse passer sans erreur sinon.
export const optionalAuth = createMiddleware<{ Variables: Partial<AuthVariables> }>(
  async (c, next) => {
    const payload = verifyToken(extractBearer(c.req.header('Authorization')))
    if (payload) c.set('user', payload)
    await next()
  },
)

// À chaîner après `requireAuth` : 403 si le rôle n'est pas dans la liste.
export function requireRole(...roles: Role[]) {
  return createMiddleware<{ Variables: AuthVariables }>(async (c, next) => {
    const user = c.get('user')
    if (!user || !roles.includes(user.role)) {
      throw new Interdit()
    }
    await next()
  })
}
