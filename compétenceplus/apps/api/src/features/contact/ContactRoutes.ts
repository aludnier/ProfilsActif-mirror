import { Hono } from 'hono'

import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import {
  createContactHandler,
  deleteContactHandler,
  getContactHandler,
  getContactsByRecruiterHandler,
  getContactsBySeekerHandler,
  updateContactHandler,
} from './ContactHandler.js'

export const contactRoutes = new Hono<{ Variables: AuthVariables }>()
contactRoutes.use('*', requireAuth)
/**
 * @openapi
 * /contacts/recruiter/{recruiterId}:
 *   get:
 *     tags: [Contacts]
 *     summary: Récupère les contacts d'un recruteur
 *     parameters:
 *       - in: path
 *         name: recruiterId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contacts récupérés
 */
contactRoutes.get('/recruiter/:recruiterId',getContactsByRecruiterHandler)

/**
 * @openapi
 * /contacts/seeker/{seekerId}:
 *   get:
 *     tags: [Contacts]
 *     summary: Récupère les contacts d'un candidat
 *     parameters:
 *       - in: path
 *         name: seekerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contacts récupérés
 */
contactRoutes.get('/seeker/:seekerId', getContactsBySeekerHandler)

/**
 * @openapi
 * /contacts/{id}:
 *   get:
 *     tags: [Contacts]
 *     summary: Récupère un contact par identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact trouvé
 *       404:
 *         description: Contact introuvable
 */
contactRoutes.get('/:id', getContactHandler)

/**
 * @openapi
 * /contacts:
 *   post:
 *     tags: [Contacts]
 *     summary: Crée un contact
 *     responses:
 *       201:
 *         description: Contact créé
 */
contactRoutes.post('/', createContactHandler)

/**
 * @openapi
 * /contacts/{id}:
 *   patch:
 *     tags: [Contacts]
 *     summary: Met à jour un contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contact mis à jour
 */
contactRoutes.patch('/:id', updateContactHandler)

/**
 * @openapi
 * /contacts/{id}:
 *   delete:
 *     tags: [Contacts]
 *     summary: Supprime un contact
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Contact supprimé
 */
contactRoutes.delete('/:id', deleteContactHandler)
