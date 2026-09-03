import type { Context } from 'hono'
import { ValidationInvalide } from '../../shared/errors.js'
import { FavoriteService } from './FavoriteService.js'
import { createFavoriteSchema } from './FavoriteSchema.js'

const favoriteService = new FavoriteService()

export async function createFavoriteHandler(c: Context) {
  const body = await c.req.json()

  const result = createFavoriteSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données du favori invalides',
      'FAVORITE_DONNEES_INVALIDES',
    )
  }

  const favorite = await favoriteService.createFavorite(result.data)

  return c.json(favorite, 201)
}

export async function getFavoritesByRecruiterHandler(c: Context) {
  const recruiterId = c.req.param('recruiterId')

  if (!recruiterId) {
    throw new ValidationInvalide(
      'Identifiant du recruteur invalide',
      'RECRUTEUR_ID_INVALIDE',
    )
  }

  const favorites =
    await favoriteService.getFavoritesByRecruiter(recruiterId)

  return c.json(favorites)
}

export async function deleteFavoriteHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du favori invalide',
      'FAVORITE_ID_INVALIDE',
    )
  }

  await favoriteService.deleteFavorite(id)

  return c.body(null, 204)
}