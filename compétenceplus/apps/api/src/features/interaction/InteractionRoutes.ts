import { Hono } from 'hono'

import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ValidationInvalide } from '../../shared/errors.js'
import { listNotificationsQuery, notificationIdParam } from './InteractionSchema.js'
import { InteractionService } from './InteractionService.js'

const service = new InteractionService()

export const interactionRoutes = new Hono<{ Variables: AuthVariables }>()

interactionRoutes.use('*', requireAuth, requireRole('seeker'))

/**
 * @openapi
 * /interactions/notifications:
 *   get:
 *     tags: [Interactions]
 *     summary: Liste les notifications d'un utilisateur
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Notifications récupérées
 */
interactionRoutes.get('/notifications', async (c) => {
  const filtre = listNotificationsQuery.safeParse({ unread: c.req.query('unread') })
  if (!filtre.success) throw new ValidationInvalide('Filtre invalide', 'FILTRE_INVALIDE')
  return c.json(await service.listNotifications(c.get('user').id, filtre.data.unread))
})

/**
 * @openapi
 * /interactions/notifications/unread-count:
 *   get:
 *     tags: [Interactions]
 *     summary: Compte les notifications non lues
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Nombre de notifications non lues
 */
interactionRoutes.get('/notifications/unread-count', async (c) =>
  c.json({ count: await service.countUnread(c.get('user').id) }),
)

/**
 * @openapi
 * /interactions/notifications/read-all:
 *   post:
 *     tags: [Interactions]
 *     summary: Marque toutes les notifications comme lues
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Notifications mises à jour
 */
interactionRoutes.post('/notifications/read-all', async (c) =>
  c.json({ updated: await service.markAllRead(c.get('user').id) }),
)

/**
 * @openapi
 * /interactions/notifications/{id}/read:
 *   patch:
 *     tags: [Interactions]
 *     summary: Marque une notification comme lue
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
 *         description: Notification marquée comme lue
 */
interactionRoutes.patch('/notifications/:id/read', async (c) => {
  const params = notificationIdParam.safeParse({ id: c.req.param('id') })
  if (!params.success) throw new ValidationInvalide('Identifiant invalide', 'NOTIFICATION_ID_INVALIDE')
  await service.markRead(params.data.id, c.get('user').id)
  return c.json({ ok: true })
})
