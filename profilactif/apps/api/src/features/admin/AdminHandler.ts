import type { Context } from 'hono'
import {ValidationInvalide} from '../../shared/errors.js'
import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { NonTrouve } from '../../shared/errors.js'
import { VideoRepository } from '../video/VideoRepository.js'
import { moderateVideoSchema } from '../video/VideoSchema.js'
import {AdminService} from './AdminService.js'
import {listUsersSchema, updateUserProfileSchema, updateUserRoleSchema, updateUserStatusSchema} from './AdminSchema.js'

const adminService = new AdminService()

function getCurrentAdminId(c: Context): string | undefined {
  const payload = c.get('user') as AuthVariables['user'] | undefined
  return payload?.id
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


export async function updateUserProfileHandler(c: Context) {
  const id = c.req.param('id')
  const result = updateUserProfileSchema.safeParse(await c.req.json())
  if (!id || !result.success) {
    throw new ValidationInvalide('Données utilisateur invalides', 'UTILISATEUR_DONNEES_INVALIDES')
  }
  return c.json(await adminService.updateUserProfile(id, result.data))
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

const videoRepository = new VideoRepository()

export async function getPendingVideosHandler(c: Context) {
  return c.json(await videoRepository.findPending())
}

export async function updateVideoStatusHandler(c: Context) {
  const id = c.req.param('id')
  const adminId = (c.get('user') as AuthVariables['user']).id
  const result = moderateVideoSchema.safeParse(await c.req.json())
  if (!id || !result.success) {
    throw new ValidationInvalide('Données de modération vidéo invalides', 'MODERATION_VIDEO_INVALIDE')
  }

  const video = await videoRepository.updateStatus(id, result.data.status, adminId, result.data.reason ?? null)
  if (!video) throw new NonTrouve('Vidéo introuvable', 'VIDEO_NON_TROUVEE')
  return c.json(video)
}
