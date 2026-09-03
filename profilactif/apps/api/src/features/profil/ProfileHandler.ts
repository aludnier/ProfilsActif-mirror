import type { Context } from 'hono'
import { ValidationInvalide } from '../../shared/errors.js'
import { ProfileService } from './ProfileService.js'
import { updateProfilSchema } from './ProfilSchema.js'

const profileService = new ProfileService()

export async function getProfilHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de profil invalide',
      'PROFIL_ID_INVALIDE',
    )
  }

  const profil = await profileService.getProfil(id)

  return c.json(profil)
}

export async function updateProfilHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de profil invalide',
      'PROFIL_ID_INVALIDE',
    )
  }

  const body = await c.req.json()

  const result = updateProfilSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données du profil invalides',
      'PROFIL_DONNEES_INVALIDES',
    )
  }

  const profil = await profileService.updateProfil(
    id,
    result.data,
  )

  return c.json(profil)
}