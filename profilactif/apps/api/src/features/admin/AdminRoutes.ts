import { Hono } from 'hono'
import { requireAuth, requireRole, type AuthVariables } from '../../infrastructure/auth.middleware.js'

import {deleteUserHandler, getUserByIdHandler, getUsersHandler, updateUserRoleHandler, updateUserStatusHandler, updateUserProfileHandler, getPendingVideosHandler, updateVideoStatusHandler} from './AdminHandler.js'

export const adminRoutes = new Hono<{ Variables: AuthVariables }>()

adminRoutes.use('*', requireAuth, requireRole('admin'))

adminRoutes.get('/users', getUsersHandler)

adminRoutes.get('/users/:id', getUserByIdHandler)

adminRoutes.patch('/users/:id/profile', updateUserProfileHandler)
adminRoutes.patch('/users/:id/status', updateUserStatusHandler)

adminRoutes.patch('/users/:id/role',updateUserRoleHandler)

adminRoutes.delete('/users/:id', deleteUserHandler)
adminRoutes.get('/videos/pending', getPendingVideosHandler)
adminRoutes.patch('/videos/:id/status', updateVideoStatusHandler)
