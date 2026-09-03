import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import { gestionnaireErreurs } from './shared/errors.js'
import { authRoutes } from './features/auth/AuthRoutes.js'
import { favoriteRoutes } from './features/favorite/FavoriteRoutes.js'
import { skillRoutes } from './features/skill/SkillRoutes.js'
import { recruiterRoutes } from './features/recruiter/RecruiterRoutes.js'
import { profilRoutes } from './features/profil/ProfilRoutes.js'
import { videoRoutes } from './features/video/VideoRoutes.js'
import { contactRoutes } from './features/contact/ContactRoutes.js'

const app = new Hono()

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(','),
    allowMethods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
)

app.onError(gestionnaireErreurs)
app.notFound((c) => c.json({ code: 'NON_TROUVE', message: 'Route inconnue' }, 404))

// Sonde de disponibilité (compose, déploiement, test de fumée).
app.get('/sante', (c) => c.json({ statut: 'ok' }))

app.route('/auth', authRoutes)
app.route('/skills', skillRoutes)
app.route('/recruiters', recruiterRoutes)
app.route('/profiles', profilRoutes)
app.route('/favorites', favoriteRoutes)
app.route('/videos', videoRoutes)
app.route('/contacts', contactRoutes)

export default app
