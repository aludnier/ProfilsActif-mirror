import { Conflit, Interdit, NonTrouve } from '../../shared/errors.js'
import { ContactRepository, type NewContact } from './ContactRepository.js'
import type { UpdateContactInput } from './ContactSchema.js'

export class ContactService {
  constructor(private readonly contactRepository = new ContactRepository()) {}

  async getContact(id: string) {
    const contact = await this.contactRepository.findById(id)
    if (!contact) {
      throw new NonTrouve('Contact introuvable', 'CONTACT_NON_TROUVE')
    }
    return contact
  }

  async getContactsByRecruiter(recruiterId: string) {
    return this.contactRepository.findByRecruiter(recruiterId)
  }

  async getContactsBySeeker(seekerId: string) {
    return this.contactRepository.findBySeeker(seekerId)
  }

  async createContact(data: NewContact) {
    const existing = await this.contactRepository.findByRecruiterAndSeeker(
      data.recruiterId,
      data.seekerId,
    )
    if (existing) {
      throw new Conflit('Vous avez déjà contacté ce candidat', 'CONTACT_DEJA_EXISTANT')
    }

    return this.contactRepository.create(data)
  }

  async updateContact(id: string, data: UpdateContactInput, recruiterId: string) {
    await this.assertProprietaire(id, recruiterId)
    await this.contactRepository.update(id, data)
    return this.getContact(id)
  }

  async deleteContact(id: string, recruiterId: string) {
    await this.assertProprietaire(id, recruiterId)
    await this.contactRepository.delete(id)
  }

  private async assertProprietaire(id: string, recruiterId: string) {
    const contact = await this.getContact(id)
    if (contact.recruiterId !== recruiterId) {
      throw new Interdit('Ce contact ne vous appartient pas', 'CONTACT_NON_PROPRIETAIRE')
    }
  }
}
