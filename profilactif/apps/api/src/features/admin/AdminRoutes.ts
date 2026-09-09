import { Hono } from 'hono'
import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'

import {deleteUserHandler, getUserByIdHandler, getUsersHandler, updateUserRoleHandler, updateUserStatusHandler, updateUserProfileHandler, getPendingVideosHandler, updateVideoStatusHandler, getStatsHandler} from './AdminHandler.js'

export const adminRoutes = new Hono<{ Variables: AuthVariables }>()

adminRoutes.use('*', requireAuth, requireRole('admin'))

adminRoutes.get('/stats', getStatsHandler)

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Récupère la liste des utilisateurs
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
adminRoutes.get('/users', getUsersHandler)

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Récupère un utilisateur par identifiant
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
 *         description: Utilisateur trouvé
 */
adminRoutes.get('/users/:id', getUserByIdHandler)

/**
 * @openapi
 * /admin/users/{id}/profile:
 *   patch:
 *     tags: [Admin]
 *     summary: Met à jour le profil administratif d'un utilisateur
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
 */
adminRoutes.patch('/users/:id/profile', updateUserProfileHandler)

/**
 * @openapi
 * /admin/users/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Met à jour le statut d'un utilisateur
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
 *         description: Statut mis à jour
 */
adminRoutes.patch('/users/:id/status', updateUserStatusHandler)

/**
 * @openapi
 * /admin/users/{id}/role:
 *   patch:
 *     tags: [Admin]
 *     summary: Met à jour le rôle d'un utilisateur
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
 *         description: Rôle mis à jour
 */
adminRoutes.patch('/users/:id/role',updateUserRoleHandler)

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Supprime un utilisateur
 *     security:
 *       - Bearer: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Utilisateur supprimé
 */
adminRoutes.delete('/users/:id', deleteUserHandler)

/**
 * @openapi
 * /admin/videos/pending:
 *   get:
 *     tags: [Admin]
 *     summary: Récupère les vidéos en attente de validation
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Vidéos en attente
 */
adminRoutes.get('/videos/pending', getPendingVideosHandler)

/**
 * @openapi
 * /admin/videos/{id}/status:
 *   patch:
 *     tags: [Admin]
 *     summary: Met à jour le statut d'une vidéo
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
 *         description: Statut vidéo mis à jour
 */
adminRoutes.patch('/videos/:id/status', updateVideoStatusHandler)
