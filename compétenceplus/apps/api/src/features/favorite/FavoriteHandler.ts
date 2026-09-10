import type { Context } from 'hono'

import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { Interdit, ValidationInvalide } from '../../shared/errors.js'
import { FavoriteService } from './FavoriteService.js'
import { createFavoriteSchema } from './FavoriteSchema.js'

const favoriteService = new FavoriteService()

function currentUserId(c: Context): string {
  return (c.get('user') as AuthVariables['user']).id
}

export async function createFavoriteHandler(c: Context) {
  const result = createFavoriteSchema.safeParse(await c.req.json())
  if (!result.success) {
    throw new ValidationInvalide('Données du favori invalides', 'FAVORITE_DONNEES_INVALIDES')
  }

  const favorite = await favoriteService.createFavorite({
    recruiterId: currentUserId(c),
    seekerId: result.data.seekerId,
  })

  return c.json(favorite, 201)
}

export async function getFavoritesByRecruiterHandler(c: Context) {
  const recruiterId = c.req.param('recruiterId')
  if (!recruiterId) {
    throw new ValidationInvalide('Identifiant du recruteur invalide', 'RECRUTEUR_ID_INVALIDE')
  }
  if (recruiterId !== currentUserId(c)) {
    throw new Interdit('Vous ne pouvez consulter que vos propres favoris', 'FAVORITE_NON_PROPRIETAIRE')
  }

  return c.json(await favoriteService.getFavoritesByRecruiter(recruiterId))
}

export async function deleteFavoriteHandler(c: Context) {
  const id = c.req.param('id')
  if (!id) {
    throw new ValidationInvalide('Identifiant du favori invalide', 'FAVORITE_ID_INVALIDE')
  }

  await favoriteService.deleteFavorite(id, currentUserId(c))
  return c.body(null, 204)
}
