import { NonTrouve } from '../../shared/errors.js'
import { ContactRepository } from './ContactRepository.js'
import type {CreateContactInput, UpdateContactInput} from './ContactSchema.js'

export class ContactService {
  constructor(
    private readonly contactRepository = new ContactRepository(),
  ) {}

  async getContact(id: string) {
    const contact =
      await this.contactRepository.findById(id)

    if (!contact) {
      throw new NonTrouve(
        'Contact introuvable',
        'CONTACT_NON_TROUVE',
      )
    }

    return contact
  }

  async getContactsByRecruiter(
    recruiterId: string,
  ) {
    return this.contactRepository.findByRecruiter(
      recruiterId,
    )
  }

  async getContactsBySeeker(
    seekerId: string,
  ) {
    return this.contactRepository.findBySeeker(
      seekerId,
    )
  }

  async createContact(
    data: CreateContactInput,
  ) {
    return this.contactRepository.create(data)
  }

  async updateContact(
    id: string,
    data: UpdateContactInput,
  ) {
    await this.getContact(id)

    await this.contactRepository.update(
      id,
      data,
    )

    return this.getContact(id)
  }

  async deleteContact(id: string) {
    await this.getContact(id)

    await this.contactRepository.delete(id)
  }
}