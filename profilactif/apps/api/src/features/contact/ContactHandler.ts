import type { Context } from 'hono'
import { ValidationInvalide } from '../../shared/errors.js'
import { ContactService } from './ContactService.js'
import {createContactSchema, updateContactSchema} from './ContactSchema.js'

const contactService = new ContactService()

export async function getContactHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du contact invalide',
      'CONTACT_ID_INVALIDE',
    )
  }

  const contact =
    await contactService.getContact(id)

  return c.json(contact)
}

export async function getContactsByRecruiterHandler(
  c: Context,
) {
  const recruiterId = c.req.param('recruiterId')

  if (!recruiterId) {
    throw new ValidationInvalide(
      'Identifiant du recruteur invalide',
      'RECRUTEUR_ID_INVALIDE',
    )
  }

  const contacts =
    await contactService.getContactsByRecruiter(
      recruiterId,
    )

  return c.json(contacts)
}

export async function getContactsBySeekerHandler(
  c: Context,
) {
  const seekerId = c.req.param('seekerId')

  if (!seekerId) {
    throw new ValidationInvalide(
      'Identifiant du demandeur invalide',
      'SEEKER_ID_INVALIDE',
    )
  }

  const contacts =
    await contactService.getContactsBySeeker(
      seekerId,
    )

  return c.json(contacts)
}

export async function createContactHandler(
  c: Context,
) {
  const body = await c.req.json()

  const result =
    createContactSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données du contact invalides',
      'CONTACT_DONNEES_INVALIDES',
    )
  }

  const contact =
    await contactService.createContact(
      result.data,
    )

  return c.json(contact, 201)
}

export async function updateContactHandler(
  c: Context,
) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du contact invalide',
      'CONTACT_ID_INVALIDE',
    )
  }

  const body = await c.req.json()

  const result =
    updateContactSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données du contact invalides',
      'CONTACT_DONNEES_INVALIDES',
    )
  }

  const contact =
    await contactService.updateContact(
      id,
      result.data,
    )

  return c.json(contact)
}

export async function deleteContactHandler(
  c: Context,
) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant du contact invalide',
      'CONTACT_ID_INVALIDE',
    )
  }

  await contactService.deleteContact(id)

  return c.body(null, 204)
}