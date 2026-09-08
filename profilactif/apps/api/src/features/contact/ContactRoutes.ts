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

contactRoutes.get('/recruiter/:recruiterId', getContactsByRecruiterHandler)
contactRoutes.get('/seeker/:seekerId', getContactsBySeekerHandler)
contactRoutes.get('/:id', getContactHandler)

contactRoutes.post('/', requireRole('recruiter'), createContactHandler)
contactRoutes.patch('/:id', requireRole('recruiter'), updateContactHandler)
contactRoutes.delete('/:id', requireRole('recruiter'), deleteContactHandler)
