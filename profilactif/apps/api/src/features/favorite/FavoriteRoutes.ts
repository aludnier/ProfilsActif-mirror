import { Hono } from 'hono'

import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import {
  createFavoriteHandler,
  deleteFavoriteHandler,
  getFavoritesByRecruiterHandler,
} from './FavoriteHandler.js'

export const favoriteRoutes = new Hono<{ Variables: AuthVariables }>()

favoriteRoutes.use('*', requireAuth, requireRole('recruiter'))

favoriteRoutes.post('/', createFavoriteHandler)
favoriteRoutes.get('/recruiter/:recruiterId', getFavoritesByRecruiterHandler)
favoriteRoutes.delete('/:id', deleteFavoriteHandler)
