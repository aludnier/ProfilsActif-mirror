import { Hono } from 'hono'
import {createContactHandler, deleteContactHandler, getContactHandler, getContactsByRecruiterHandler,
  getContactsBySeekerHandler,updateContactHandler} from './ContactHandler.js'

export const contactRoutes = new Hono()

contactRoutes.get('/recruiter/:recruiterId',getContactsByRecruiterHandler)
contactRoutes.get('/seeker/:seekerId', getContactsBySeekerHandler)
contactRoutes.get('/:id', getContactHandler)
contactRoutes.post('/', createContactHandler)
contactRoutes.patch('/:id', updateContactHandler)
contactRoutes.delete('/:id', deleteContactHandler)