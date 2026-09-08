import { Hono } from 'hono'
import { requireAuth } from '../../infrastructure/auth.middleware.js'
import {getCompetencesHandler, getProfilHandler, getProfilsHandler, updateCompetencesHandler, updateProfilHandler} from './ProfileHandler.js'

export const profilRoutes = new Hono()

profilRoutes.get('/', getProfilsHandler)
profilRoutes.get('/:id', getProfilHandler)
profilRoutes.get('/:id/competences', getCompetencesHandler)

profilRoutes.patch('/:id', requireAuth, updateProfilHandler)
profilRoutes.put('/:id/competences', requireAuth, updateCompetencesHandler)
