import { Hono } from 'hono'
import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ValidationInvalide } from '../../shared/errors.js'
import { CertificationService } from './CertificationService.js'
import { createAttemptSchema, createQuestionnaireSchema, updateAttemptSchema, createQuestionInput, createQuestionSchema } from './CertificationSchema.js'

const service = new CertificationService()
export const certificationRoutes = new Hono<{ Variables: AuthVariables }>()

/**
 * @openapi
 * /certifications:
 *   get:
 *     tags: [Certifications]
 *     summary: Récupère les certifications publiées
 *     responses:
 *       200:
 *         description: Certifications publiées
 */
certificationRoutes.get('/', async (c) => c.json(await service.getPublished()))

/**
 * @openapi
 * /certifications/draft:
 *   get:
 *     tags: [Certifications]
 *     summary: Récupère les certifications en brouillon
 *     responses:
 *       200:
 *         description: Certifications en brouillon
 */
certificationRoutes.get('/draft', async (c) => c.json(await service.getDraft()))

/**
 * @openapi
 * /certifications/{id}:
 *   get:
 *     tags: [Certifications]
 *     summary: Récupère une certification par son identifiant
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certification trouvée
 */
certificationRoutes.get('/:id', async (c) => c.json(await service.getVersion(c.req.param('id'))))

/**
 * @openapi
 * /certifications:
 *   post:
 *     tags: [Certifications]
 *     summary: Crée un questionnaire de certification
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Questionnaire créé
 */
certificationRoutes.post('/', requireAuth, requireRole('admin'), async (c) => {
  const result = createQuestionnaireSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Questionnaire invalide', 'QUESTIONNAIRE_INVALIDE')
  return c.json(await service.createQuestionnaire(result.data, c.get('user').id), 201)
})

/**
 * @openapi
 * /certifications/{id}/publish:
 *   post:
 *     tags: [Certifications]
 *     summary: Publie une certification
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
 *         description: Certification publiée
 */
certificationRoutes.post('/:id/publish', requireAuth, requireRole('admin'), async (c) =>
  c.json(await service.publishQuestionnaire(c.req.param('id'))),
)

/**
 * @openapi
 * /certifications/{id}/draft:
 *   post:
 *     tags: [Certifications]
 *     summary: Passe une certification en brouillon
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
 *         description: Certification mise en brouillon
 */
certificationRoutes.post('/:id/draft', requireAuth, requireRole('admin'), async (c) =>
  c.json(await service.publishQuestionnaireDraft(c.req.param('id'))),
)

/**
 * @openapi
 * /certifications/attempts:
 *   post:
 *     tags: [Certifications]
 *     summary: Démarre une tentative de certification
 *     security:
 *       - Bearer: []
 *     responses:
 *       201:
 *         description: Tentative créée
 */
certificationRoutes.post('/attempts', requireAuth, requireRole('seeker'), async (c) => {
  const result = createAttemptSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Tentative invalide', 'TENTATIVE_INVALIDE')
  return c.json(await service.createAttempt(result.data, c.get('user').id), 201)
})

/* Comme « en-cours » : doit précéder `/attempts/:id`. */
certificationRoutes.get('/attempts/derniere', requireAuth, requireRole('seeker'), async (c) =>
  c.json(await service.getLastSubmittedAttempt(c.get('user').id)),
)

/* Doit précéder `/attempts/:id`, sinon « en-cours » serait pris pour un identifiant. */
certificationRoutes.get('/attempts/en-cours', requireAuth, requireRole('seeker'), async (c) =>
  c.json(await service.getCurrentAttempt(c.get('user').id)),
)

/**
 * @openapi
 * /certifications/attempts/{id}:
 *   get:
 *     tags: [Certifications]
 *     summary: Récupère une tentative de certification
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
 *         description: Tentative récupérée
 */
certificationRoutes.get('/attempts/:id', requireAuth, requireRole('seeker'), async (c) =>
  c.json(await service.getAttempt(c.req.param('id'), c.get('user').id)),
)

/**
 * @openapi
 * /certifications/attempts/{id}:
 *   patch:
 *     tags: [Certifications]
 *     summary: Met à jour une tentative de certification
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
 *         description: Tentative mise à jour
 */
certificationRoutes.patch('/attempts/:id', requireAuth, requireRole('seeker'), async (c) => {
  const result = updateAttemptSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Tentative invalide', 'TENTATIVE_INVALIDE')
  return c.json(await service.updateAttempt(c.req.param('id'), c.get('user').id, result.data))
})
