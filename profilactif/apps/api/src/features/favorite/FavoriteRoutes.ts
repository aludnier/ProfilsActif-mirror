import { Hono } from 'hono'

import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import {
  createFavoriteHandler,
  deleteFavoriteHandler,
  getFavoritesByRecruiterHandler,
} from './FavoriteHandler.js'

export const favoriteRoutes = new Hono<{ Variables: AuthVariables }>()

favoriteRoutes.use('*', requireAuth, requireRole('recruiter'))

/**
 * @openapi
 * /favorites:
 *   post:
 *     tags: [Favorites]
 *     summary: Ajoute un candidat en favori
 *     responses:
 *       201:
 *         description: Favori créé
 */
favoriteRoutes.post('/', createFavoriteHandler)

/**
 * @openapi
 * /favorites/recruiter/{recruiterId}:
 *   get:
 *     tags: [Favorites]
 *     summary: Récupère les favoris d'un recruteur
 *     parameters:
 *       - in: path
 *         name: recruiterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des favoris
 */
favoriteRoutes.get('/recruiter/:recruiterId', getFavoritesByRecruiterHandler)

/**
 * @openapi
 * /favorites/{id}:
 *   delete:
 *     tags: [Favorites]
 *     summary: Supprime un favori
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Favori supprimé
 *       404:
 *         description: Favori introuvable
 */
favoriteRoutes.delete('/:id', deleteFavoriteHandler)
