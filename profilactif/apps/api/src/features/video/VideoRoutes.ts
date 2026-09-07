import { Hono } from 'hono'
import { requireAuth } from '../../infrastructure/auth.middleware.js'
import {createVideoHandler, deleteVideoHandler, getVideoHandler, getVideosBySeekerHandler,
    updateVideoHandler} from './VideoHandler.js'

export const videoRoutes = new Hono()
videoRoutes.use('*', requireAuth)

videoRoutes.get('/seeker/:seekerId', getVideosBySeekerHandler)
videoRoutes.get('/:id', getVideoHandler)
videoRoutes.post('/', createVideoHandler)
videoRoutes.patch('/:id', updateVideoHandler)
videoRoutes.delete('/:id', deleteVideoHandler)