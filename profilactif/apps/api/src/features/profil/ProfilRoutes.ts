import { Hono } from 'hono'
import { optionalAuth, requireAuth } from '../../infrastructure/auth.middleware.js'
import {getCompetencesHandler, getConsultationsHandler, getProfilHandler, getProfilsHandler, getProfilsPageHandler, updateCompetencesHandler, updateProfilHandler} from './ProfileHandler.js'

export const profilRoutes = new Hono()

/**
 * @openapi
 * /profiles:
 *   get:
 *     tags: [Profiles]
 *     summary: Récupère la liste des profils
 *     responses:
 *       200:
 *         description: Liste des profils
 */
profilRoutes.get('/', getProfilsHandler)

/**
 * @openapi
 * /profiles/{id}:
 *   get:
 *     tags: [Profiles]
 *     summary: Récupère un profil par son identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil trouvé
 *       404:
 *         description: Profil introuvable
 */
profilRoutes.get('/catalogue', getProfilsPageHandler)
profilRoutes.get('/:id', optionalAuth, getProfilHandler)

/**
 * @openapi
 * /profiles/{id}/competences:
 *   get:
 *     tags: [Profiles]
 *     summary: Récupère les compétences d'un profil
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compétences du profil
 *       404:
 *         description: Profil introuvable
 */
profilRoutes.get('/:id/competences', optionalAuth, getCompetencesHandler)
profilRoutes.get('/:id/consultations', requireAuth, getConsultationsHandler)

/**
 * @openapi
 * /profiles/{id}:
 *   patch:
 *     tags: [Profiles]
 *     summary: Met à jour un profil utilisateur
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       401:
 *         description: Non authentifié
 */
profilRoutes.patch('/:id', requireAuth, updateProfilHandler)

/**
 * @openapi
 * /profiles/{id}/competences:
 *   put:
 *     tags: [Profiles]
 *     summary: Met à jour les compétences d'un profil
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compétences mises à jour
 *       401:
 *         description: Non authentifié
 */
profilRoutes.put('/:id/competences', requireAuth, updateCompetencesHandler)
