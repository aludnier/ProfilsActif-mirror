import { Hono } from 'hono'
import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ValidationInvalide } from '../../shared/errors.js'
import { CertificationService } from './CertificationService.js'
import { createAttemptSchema, createQuestionnaireSchema, updateAttemptSchema, createQuestionInput, createQuestionSchema } from './CertificationSchema.js'

const service = new CertificationService()
export const certificationRoutes = new Hono<{ Variables: AuthVariables }>()

certificationRoutes.get('/', async (c) => c.json(await service.getPublished()))
certificationRoutes.get('/draft', async (c) => c.json(await service.getDraft()))
certificationRoutes.get('/:id', async (c) => c.json(await service.getVersion(c.req.param('id'))))


certificationRoutes.post('/', requireAuth, requireRole('admin'), async (c) => {
  const result = createQuestionnaireSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Questionnaire invalide', 'QUESTIONNAIRE_INVALIDE')
  return c.json(await service.createQuestionnaire(result.data, c.get('user').id), 201)
})

certificationRoutes.post('/:id/publish', requireAuth, requireRole('admin'), async (c) =>
  c.json(await service.publishQuestionnaire(c.req.param('id'))),
)

certificationRoutes.post('/:id/draft', requireAuth, requireRole('admin'), async (c) =>
  c.json(await service.publishQuestionnaireDraft(c.req.param('id'))),
)

certificationRoutes.post('/attempts', requireAuth, requireRole('seeker'), async (c) => {
  const result = createAttemptSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Tentative invalide', 'TENTATIVE_INVALIDE')
  return c.json(await service.createAttempt(result.data, c.get('user').id), 201)
})

/* Doit précéder `/attempts/:id`, sinon « en-cours » serait pris pour un identifiant. */
certificationRoutes.get('/attempts/en-cours', requireAuth, requireRole('seeker'), async (c) =>
  c.json(await service.getCurrentAttempt(c.get('user').id)),
)

certificationRoutes.get('/attempts/:id', requireAuth, requireRole('seeker'), async (c) =>
  c.json(await service.getAttempt(c.req.param('id'), c.get('user').id)),
)

certificationRoutes.patch('/attempts/:id', requireAuth, requireRole('seeker'), async (c) => {
  const result = updateAttemptSchema.safeParse(await c.req.json())
  if (!result.success) throw new ValidationInvalide('Tentative invalide', 'TENTATIVE_INVALIDE')
  return c.json(await service.updateAttempt(c.req.param('id'), c.get('user').id, result.data))
})
