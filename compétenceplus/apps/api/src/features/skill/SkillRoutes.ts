import { Hono } from 'hono'

import { SkillHandler } from './SkillHandler.js'
import { SkillRepository } from './SkillRepository.js'
import { SkillService } from './SkillService.js'

const repository = new SkillRepository()
const service = new SkillService(repository)
const handler = new SkillHandler(service)

export const skillRoutes = new Hono()

/**
 * @openapi
 * /skills:
 *   get:
 *     tags: [Skills]
 *     summary: Récupère toutes les compétences
 *     responses:
 *       200:
 *         description: Liste des compétences
 */
skillRoutes.get('/', handler.getAll)

/**
 * @openapi
 * /skills/{id}:
 *   get:
 *     tags: [Skills]
 *     summary: Récupère une compétence par son identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compétence trouvée
 *       404:
 *         description: Compétence introuvable
 */
skillRoutes.get('/:id', handler.getById)

/**
 * @openapi
 * /skills:
 *   post:
 *     tags: [Skills]
 *     summary: Crée une nouvelle compétence
 *     responses:
 *       201:
 *         description: Compétence créée
 */
skillRoutes.post('/', handler.create)

/**
 * @openapi
 * /skills/{id}:
 *   put:
 *     tags: [Skills]
 *     summary: Met à jour une compétence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Compétence mise à jour
 *       404:
 *         description: Compétence introuvable
 */
skillRoutes.put('/:id', handler.update)

/**
 * @openapi
 * /skills/{id}:
 *   delete:
 *     tags: [Skills]
 *     summary: Supprime une compétence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Compétence supprimée
 *       404:
 *         description: Compétence introuvable
 */
skillRoutes.delete('/:id', handler.delete)
