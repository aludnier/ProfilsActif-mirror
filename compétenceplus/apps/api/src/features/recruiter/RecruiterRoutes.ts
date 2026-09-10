import { Hono } from 'hono'
import {getRecruiterHandler, updateRecruiterHandler} from './RecruiterHandler.js'

export const recruiterRoutes = new Hono()

/**
 * @openapi
 * /recruiters/{id}:
 *   get:
 *     tags: [Recruiters]
 *     summary: Récupère un recruteur par son identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recruteur trouvé
 *       404:
 *         description: Recruteur introuvable
 */
recruiterRoutes.get('/:id', getRecruiterHandler)

/**
 * @openapi
 * /recruiters/{id}:
 *   patch:
 *     tags: [Recruiters]
 *     summary: Met à jour le profil d'un recruteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profil recruteur mis à jour
 *       404:
 *         description: Recruteur introuvable
 */
recruiterRoutes.patch(
  '/:id',
  updateRecruiterHandler,
)
