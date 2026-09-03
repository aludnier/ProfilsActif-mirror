import { Hono } from 'hono'
import {getProfilHandler,updateProfilHandler} from './ProfileHandler.js'

export const profilRoutes = new Hono()

profilRoutes.get('/:id', getProfilHandler)

profilRoutes.patch('/:id', updateProfilHandler)