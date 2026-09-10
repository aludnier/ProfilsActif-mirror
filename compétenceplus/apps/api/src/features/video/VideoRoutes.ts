import { Hono } from 'hono'
import { requireAuth } from '../../infrastructure/auth.middleware.js'
import {createVideoHandler, deleteVideoHandler, getVideoHandler, getVideosBySeekerHandler,
    updateVideoHandler} from './VideoHandler.js'

export const videoRoutes = new Hono()
videoRoutes.use('*', requireAuth)

/**
 * @openapi
 * /videos/seeker/{seekerId}:
 *   get:
 *     tags: [Videos]
 *     summary: Récupère les vidéos d'un candidat
 *     parameters:
 *       - in: path
 *         name: seekerId
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Vidéos récupérées
 *       401:
 *         description: Non authentifié
 */
videoRoutes.get('/seeker/:seekerId', getVideosBySeekerHandler)

/**
 * @openapi
 * /videos/{id}:
 *   get:
 *     tags: [Videos]
 *     summary: Récupère une vidéo par identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Vidéo trouvée
 *       404:
 *         description: Vidéo introuvable
 */
videoRoutes.get('/:id', getVideoHandler)

/**
 * @openapi
 * /videos:
 *   post:
 *     tags: [Videos]
 *     summary: Crée une vidéo
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Vidéo créée
 */
videoRoutes.post('/', createVideoHandler)

/**
 * @openapi
 * /videos/{id}:
 *   patch:
 *     tags: [Videos]
 *     summary: Met à jour une vidéo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Vidéo mise à jour
 */
videoRoutes.patch('/:id', updateVideoHandler)

/**
 * @openapi
 * /videos/{id}:
 *   delete:
 *     tags: [Videos]
 *     summary: Supprime une vidéo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - Bearer: []
 *     responses:
 *       204:
 *         description: Vidéo supprimée
 */
videoRoutes.delete('/:id', deleteVideoHandler)
