import { Hono } from 'hono'

import {deleteUserHandler, getUserByIdHandler, getUsersHandler, updateUserRoleHandler, updateUserStatusHandler} from './AdminHandler.js'

export const adminRoutes = new Hono()

adminRoutes.get('/users', getUsersHandler)

adminRoutes.get('/users/:id', getUserByIdHandler)

adminRoutes.patch('/users/:id/status', updateUserStatusHandler)

adminRoutes.patch('/users/:id/role',updateUserRoleHandler)

adminRoutes.delete('/users/:id', deleteUserHandler)