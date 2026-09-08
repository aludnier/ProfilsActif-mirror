import { Hono } from 'hono'

import { requireAuth, type AuthVariables } from '../../infrastructure/auth.middleware.js'
import { deleteMeHandler, loginHandler, meHandler, signupHandler } from './AuthHandler.js'

export const authRoutes = new Hono<{ Variables: AuthVariables }>()

authRoutes.post('/signup', signupHandler)
authRoutes.post('/login', loginHandler)
authRoutes.get('/me', requireAuth, meHandler)

authRoutes.delete('/me', requireAuth, deleteMeHandler)
