import type { Context } from 'hono'
import {ValidationInvalide} from '../../shared/errors.js'
import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { NonTrouve } from '../../shared/errors.js'
import { VideoRepository } from '../video/VideoRepository.js'
import { ProfilRepository } from '../profil/ProfilRepository.js'
import { moderatePhotoSchema } from '../profil/ProfilSchema.js'
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

export async function getStatsHandler(c: Context) {
  return c.json(await adminService.getGlobalStats())
}

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

/*
 * Modération des photos. Le dépôt de la tranche `profil` est appelé
 * directement, comme `VideoRepository` l'est plus haut : c'est le motif déjà
 * en place ici pour la modération, qui ne possède pas de table à elle.
 */
const profilRepository = new ProfilRepository()

export async function getPendingPhotosHandler(c: Context) {
  return c.json(await profilRepository.findPendingPhotos())
}

export async function updatePhotoStatusHandler(c: Context) {
  const id = c.req.param('id')
  const adminId = (c.get('user') as AuthVariables['user']).id
  const result = moderatePhotoSchema.safeParse(await c.req.json())

  if (!id || !result.success) {
    throw new ValidationInvalide('Données de modération photo invalides', 'MODERATION_PHOTO_INVALIDE')
  }

  const modifiee = await profilRepository.updatePhotoStatus(
    id,
    result.data.status,
    adminId,
    result.data.reason ?? null,
  )
  if (!modifiee) throw new NonTrouve('Photo introuvable', 'PHOTO_NON_TROUVEE')

  return c.json({ seekerId: id, status: result.data.status })
}

