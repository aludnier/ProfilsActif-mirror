import { Hono } from 'hono'

import { requireAuth, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { deleteMeHandler, loginHandler, meHandler, signupHandler } from './AuthHandler.js'

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

/**
 * @openapi
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Inscription d'un nouvel utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: jean@example.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *       409:
 *         description: Email déjà utilisé
 */
authRoutes.post('/signup', signupHandler)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Connexion utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: jean@example.com
 *               password:
 *                 type: string
 *                 example: motdepasse123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 expiresIn: { type: number }
 *       401:
 *         description: Identifiants invalides
 */
authRoutes.post('/login', loginHandler)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     security:
 *       - Bearer: []
 *     responses:
 *       200:
 *         description: Profil utilisateur
 *       401:
 *         description: Non authentifié
 */
authRoutes.get('/me', requireAuth, meHandler)

/**
 * @openapi
 * /auth/me:
 *   delete:
 *     tags: [Auth]
 *     summary: Supprimer le compte de l'utilisateur connecté
 *     security:
 *       - Bearer: []
 *     responses:
 *       204:
 *         description: Compte supprimé
 *       401:
 *         description: Non authentifié
 */
authRoutes.delete('/me', requireAuth, deleteMeHandler)
