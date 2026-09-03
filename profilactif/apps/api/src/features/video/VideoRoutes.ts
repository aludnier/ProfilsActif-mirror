import { Hono } from 'hono'
import {createVideoHandler, deleteVideoHandler, getVideoHandler, getVideosBySeekerHandler,
    updateVideoHandler} from './VideoHandler.js'

export const videoRoutes = new Hono()

videoRoutes.get('/seeker/:seekerId', getVideosBySeekerHandler)
videoRoutes.get('/:id', getVideoHandler)
videoRoutes.post('/', createVideoHandler)
videoRoutes.patch('/:id', updateVideoHandler)
videoRoutes.delete('/:id', deleteVideoHandler)