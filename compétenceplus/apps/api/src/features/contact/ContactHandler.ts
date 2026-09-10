import type { Context } from 'hono'

import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ValidationInvalide } from '../../shared/errors.js'
import { ContactService } from './ContactService.js'
import { createContactSchema, updateContactSchema } from './ContactSchema.js'

const contactService = new ContactService()

function currentUserId(c: Context): string {
  return (c.get('user') as AuthVariables['user']).id
}

export async function getContactHandler(c: Context) {
  const id = c.req.param('id')
  if (!id) {
    throw new ValidationInvalide('Identifiant du contact invalide', 'CONTACT_ID_INVALIDE')
  }
  return c.json(await contactService.getContact(id))
}

export async function getContactsByRecruiterHandler(c: Context) {
  const recruiterId = c.req.param('recruiterId')
  if (!recruiterId) {
    throw new ValidationInvalide('Identifiant du recruteur invalide', 'RECRUTEUR_ID_INVALIDE')
  }
  return c.json(await contactService.getContactsByRecruiter(recruiterId))
}

export async function getContactsBySeekerHandler(c: Context) {
  const seekerId = c.req.param('seekerId')
  if (!seekerId) {
    throw new ValidationInvalide('Identifiant du demandeur invalide', 'SEEKER_ID_INVALIDE')
  }
  return c.json(await contactService.getContactsBySeeker(seekerId))
}

export async function createContactHandler(c: Context) {
  const result = createContactSchema.safeParse(await c.req.json())
  if (!result.success) {
    throw new ValidationInvalide('Données du contact invalides', 'CONTACT_DONNEES_INVALIDES')
  }

  const contact = await contactService.createContact({
    recruiterId: currentUserId(c),
    seekerId: result.data.seekerId,
    message: result.data.message,
  })

  return c.json(contact, 201)
}

export async function updateContactHandler(c: Context) {
  const id = c.req.param('id')
  if (!id) {
    throw new ValidationInvalide('Identifiant du contact invalide', 'CONTACT_ID_INVALIDE')
  }

  const result = updateContactSchema.safeParse(await c.req.json())
  if (!result.success) {
    throw new ValidationInvalide('Données du contact invalides', 'CONTACT_DONNEES_INVALIDES')
  }

  return c.json(await contactService.updateContact(id, result.data, currentUserId(c)))
}

export async function deleteContactHandler(c: Context) {
  const id = c.req.param('id')
  if (!id) {
    throw new ValidationInvalide('Identifiant du contact invalide', 'CONTACT_ID_INVALIDE')
  }

  await contactService.deleteContact(id, currentUserId(c))
  return c.body(null, 204)
}
