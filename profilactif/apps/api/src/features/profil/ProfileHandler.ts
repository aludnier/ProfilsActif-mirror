import type { Context } from 'hono'
import { Interdit, ValidationInvalide } from '../../shared/errors.js'
import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ProfileService } from './ProfileService.js'
import { updateCompetencesSchema, updateProfilSchema } from './ProfilSchema.js'

const profileService = new ProfileService()

export async function getProfilsHandler(c: Context) {
  return c.json(await profileService.getProfils())
}

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

export async function updateProfilHandler(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param('id')
  const currentUser = c.get('user')

  if (currentUser.role !== 'admin' && currentUser.id !== id) {
    throw new Interdit(
      'Vous ne pouvez modifier que votre propre profil',
      'MODIFICATION_PROFIL_INTERDITE',
    )
  }

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


export async function getCompetencesHandler(c: Context) {
  const id = c.req.param('id')
  if (!id) throw new ValidationInvalide('Identifiant de profil invalide', 'PROFIL_ID_INVALIDE')
  return c.json({ competences: await profileService.getCompetences(id) })
}

export async function updateCompetencesHandler(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param('id')
  const currentUser = c.get('user')
  if (!id) throw new ValidationInvalide('Identifiant de profil invalide', 'PROFIL_ID_INVALIDE')
  if (
    currentUser.role !== 'admin' &&
    currentUser.role !== 'recruiter' &&
    currentUser.id !== id
  ) {
    throw new Interdit('Vous ne pouvez modifier que vos propres compétences', 'MODIFICATION_COMPETENCES_INTERDITE')
  }
  const result = updateCompetencesSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Compétences invalides', 'COMPETENCES_INVALIDES')
  return c.json({ competences: await profileService.updateCompetences(id, result.data) })
}
