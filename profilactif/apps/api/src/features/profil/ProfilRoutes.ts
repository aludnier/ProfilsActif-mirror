import { Hono } from 'hono'
import { optionalAuth, requireAuth } from '../../infrastructure/auth.middleware.js'
import { bodyLimit } from 'hono/body-limit'
import {deletePhotoHandler, getCompetencesHandler, getConsultationsHandler, getPhotoHandler, getProfilHandler, getProfilsHandler, getProfilsPageHandler, updateCompetencesHandler, updatePhotoHandler, updateProfilHandler} from './ProfileHandler.js'
import { TAILLE_MAX_PHOTO } from '../../infrastructure/photoStorage.js'

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

/**
 * @openapi
 * /profiles/{id}/photo:
 *   get:
 *     tags: [Profiles]
 *     summary: Photo de profil (image binaire)
 *     description: >
 *       Une photo en attente ou refusée n'est servie qu'à son propriétaire
 *       ou à un administrateur.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image
 *       404:
 *         description: Aucune photo visible
 */
profilRoutes.get('/:id/photo', optionalAuth, getPhotoHandler)

/**
 * @openapi
 * /profiles/{id}/photo:
 *   post:
 *     tags: [Profiles]
 *     summary: Envoie une photo de profil (multipart, champ « photo »)
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Photo enregistrée, en attente de validation
 *       413:
 *         description: Fichier trop lourd (2 Mo maximum)
 *       422:
 *         description: Format non reconnu
 */
profilRoutes.post(
  '/:id/photo',
  requireAuth,
  bodyLimit({
    maxSize: TAILLE_MAX_PHOTO,
    onError: (c) =>
      c.json({ code: 'PHOTO_TROP_LOURDE', message: 'Photo trop lourde : 2 Mo maximum' }, 413),
  }),
  updatePhotoHandler,
)

/**
 * @openapi
 * /profiles/{id}/photo:
 *   delete:
 *     tags: [Profiles]
 *     summary: Supprime la photo de profil
 *     security:
 *       - Bearer: []
 *     responses:
 *       204:
 *         description: Photo supprimée
 */
profilRoutes.delete('/:id/photo', requireAuth, deletePhotoHandler)
