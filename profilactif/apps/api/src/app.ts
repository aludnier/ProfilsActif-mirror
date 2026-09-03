import { Hono } from 'hono'
import { gestionnaireErreurs } from './shared/errors.js'
import { favoriteRoutes } from './features/favorite/FavoriteRoutes.js'
import { skillRoutes } from './features/skill/SkillRoutes.js'
import { recruiterRoutes } from './features/recruiter/RecruiterRoutes.js'
import { profilRoutes } from './features/profil/ProfilRoutes.js'
import { videoRoutes } from './features/video/VideoRoutes.js'
import { contactRoutes } from './features/contact/ContactRoutes.js'


const app = new Hono()
app.onError(gestionnaireErreurs)
app.route('/skills', skillRoutes)
app.route('/recruiters', recruiterRoutes)
app.route('/profiles', profilRoutes)
app.route('/favorites', favoriteRoutes)
app.route('/videos', videoRoutes)
app.route('/contacts', contactRoutes)


export default app