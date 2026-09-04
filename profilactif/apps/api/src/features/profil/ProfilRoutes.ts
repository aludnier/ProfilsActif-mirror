import { Hono } from 'hono'
import {getProfilsHandler, getProfilHandler,updateProfilHandler} from './ProfileHandler.js'

export const profilRoutes = new Hono()

profilRoutes.get('/', getProfilsHandler)
profilRoutes.get('/:id', getProfilHandler)

profilRoutes.patch('/:id', updateProfilHandler)