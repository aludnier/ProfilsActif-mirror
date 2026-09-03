import type { Context } from 'hono'
import { ValidationInvalide } from '../../shared/errors.js'
import { RecruiterService } from './RecruiterService.js'
import { updateRecruiterSchema } from './RecruiterSchema.js'

const recruiterService = new RecruiterService()

export async function getRecruiterHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du recruteur invalide',
      'RECRUTEUR_ID_INVALIDE',
    )
  }

  const recruiter =
    await recruiterService.getRecruiter(id)

  return c.json(recruiter)
}

export async function updateRecruiterHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du recruteur invalide',
      'RECRUTEUR_ID_INVALIDE',
    )
  }

  const body = await c.req.json()

  const result = updateRecruiterSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données du recruteur invalides',
      'RECRUTEUR_DONNEES_INVALIDES',
    )
  }

  const recruiter =
    await recruiterService.updateRecruiter(
      id,
      result.data,
    )

  return c.json(recruiter)
}