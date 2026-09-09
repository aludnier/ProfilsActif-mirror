import type { Context } from 'hono'
import { Interdit, NonTrouve, ValidationInvalide } from '../../shared/errors.js'
import { optionalAuth, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ProfileService } from './ProfileService.js'
import { updateCompetencesSchema, updateProfilSchema } from './ProfilSchema.js'

const profileService = new ProfileService()


export async function getProfilsPageHandler(c: Context) {
  const query = c.req.query()
  const split = (value?: string) => value ? value.split(',').map((item) => item.trim()).filter(Boolean) : undefined
  return c.json(await profileService.getProfilsPage({
    page: Math.max(1, Number(query.page ?? 1) || 1),
    limit: Math.min(20, Math.max(1, Number(query.limit ?? 20) || 20)),
    secteur: query.secteur?.trim() || undefined,
    localisation: query.localisation?.trim() || undefined,
    competence: query.competence?.trim() || undefined,
    niveau: query.niveau?.trim() || undefined,
    types: split(query.types),
    modalites: split(query.modalites),
    certification: query.certification?.trim() || undefined,
    contratDu: query.contratDu?.trim() || undefined,
    contratAu: query.contratAu?.trim() || undefined,
  }))
}

export async function getProfilsHandler(c: Context) {
  return c.json(await profileService.getProfils())
}

export async function getProfilHandler(c: Context<{ Variables: Partial<AuthVariables> }>) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de profil invalide',
      'PROFIL_ID_INVALIDE',
    )
  }

  const profil = await profileService.getProfil(id)
  const viewer = c.get('user')
  const canSeeWithdrawn = viewer?.role === 'admin' || viewer?.id === id

  if (!profil.catalogVisible && !canSeeWithdrawn) {
    throw new NonTrouve(
      'Ce profil n’est plus disponible.',
      'PROFIL_RETIRE_DU_CATALOGUE',
    )
  }

  if (viewer?.role === 'recruiter' && viewer.id !== id && profil.catalogVisible) {
    await profileService.recordConsultation(id, viewer.id)
  }

  return c.json(profil)
}


export async function getConsultationsHandler(c: Context<{ Variables: AuthVariables }>) {
  const id = c.req.param('id')
  const viewer = c.get('user')
  if (!id) throw new ValidationInvalide('Identifiant de profil invalide', 'PROFIL_ID_INVALIDE')
  if (viewer.id !== id && viewer.role !== 'admin') {
    throw new Interdit('Vous ne pouvez consulter que votre propre historique', 'HISTORIQUE_PROFIL_INTERDIT')
  }
  return c.json(await profileService.getConsultations(id))
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


export async function getCompetencesHandler(c: Context<{ Variables: Partial<AuthVariables> }>) {
  const id = c.req.param('id')
  if (!id) throw new ValidationInvalide('Identifiant de profil invalide', 'PROFIL_ID_INVALIDE')
  const profil = await profileService.getProfil(id)
  const viewer = c.get('user')
  if (!profil.catalogVisible && viewer?.role !== 'admin' && viewer?.id !== id) {
    throw new NonTrouve('Ce profil n’est plus disponible.', 'PROFIL_RETIRE_DU_CATALOGUE')
  }
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
