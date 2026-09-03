import { Hono } from 'hono'
import {getRecruiterHandler, updateRecruiterHandler} from './RecruiterHandler.js'

export const recruiterRoutes = new Hono()

recruiterRoutes.get('/:id', getRecruiterHandler)

recruiterRoutes.patch(
  '/:id',
  updateRecruiterHandler,
)