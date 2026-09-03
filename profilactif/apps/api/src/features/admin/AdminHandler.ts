import type { Context } from 'hono'
import {ValidationInvalide} from '../../shared/errors.js'
import {AdminService} from './AdminService.js'
import {listUsersSchema, updateUserRoleSchema, updateUserStatusSchema} from './AdminSchema.js'

const adminService = new AdminService()

function getCurrentAdminId(c: Context): string | undefined {
  const payload = c.get('jwtPayload')

  if (!payload || typeof payload.sub !== 'string') {
    return undefined
  }

  return payload.sub
}

export async function getUsersHandler(c: Context) {
  const query = c.req.query()

  const result = listUsersSchema.safeParse(query)

  if (!result.success) {
    throw new ValidationInvalide(
      'Paramètres de recherche invalides',
      'PARAMETRES_UTILISATEURS_INVALIDES',
    )
  }

  const users = await adminService.getUsers(result.data)

  return c.json(users)
}

export async function getUserByIdHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant utilisateur invalide',
      'UTILISATEUR_ID_INVALIDE',
    )
  }

  const user = await adminService.getUserById(id)

  return c.json(user)
}

export async function updateUserStatusHandler(
  c: Context,
) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant utilisateur invalide',
      'UTILISATEUR_ID_INVALIDE',
    )
  }

  const body = await c.req.json()

  const result = updateUserStatusSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Statut utilisateur invalide',
      'STATUT_UTILISATEUR_INVALIDE',
    )
  }

  const user = await adminService.updateUserStatus(
    id,
    result.data,
    getCurrentAdminId(c),
  )

  return c.json(user)
}

export async function updateUserRoleHandler(
  c: Context,
) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant utilisateur invalide',
      'UTILISATEUR_ID_INVALIDE',
    )
  }

  const body = await c.req.json()

  const result = updateUserRoleSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Rôle utilisateur invalide',
      'ROLE_UTILISATEUR_INVALIDE',
    )
  }

  const user = await adminService.updateUserRole(
    id,
    result.data,
    getCurrentAdminId(c),
  )

  return c.json(user)
}

export async function deleteUserHandler(
  c: Context,
) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant utilisateur invalide',
      'UTILISATEUR_ID_INVALIDE',
    )
  }

  const user = await adminService.deleteUser(
    id,
    getCurrentAdminId(c),
  )

  return c.json(user)
}