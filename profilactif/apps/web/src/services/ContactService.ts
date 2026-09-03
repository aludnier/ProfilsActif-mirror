import axiosInstance from '@/shared/api-client'
import type { Contact } from '@/shared/types/api'

export class ContactService {
  static async createContact(recruiterId: string, seekerId: string): Promise<Contact> {
    const { data } = await axiosInstance.post<Contact>('/contacts', {
      recruiterId,
      seekerId,
    })
    return data
  }

  static async getContact(id: string): Promise<Contact> {
    const { data } = await axiosInstance.get<Contact>(`/contacts/${id}`)
    return data
  }

  static async updateContact(id: string, updates: Partial<Contact>): Promise<Contact> {
    const { data } = await axiosInstance.patch<Contact>(`/contacts/${id}`, updates)
    return data
  }

  static async deleteContact(id: string): Promise<void> {
    await axiosInstance.delete(`/contacts/${id}`)
  }

  static async getContactsByRecruiter(recruiterId: string): Promise<Contact[]> {
    const { data } = await axiosInstance.get<Contact[]>(
      `/contacts/recruiter/${recruiterId}`,
    )
    return data
  }

  static async getContactsBySeeker(seekerId: string): Promise<Contact[]> {
    const { data } = await axiosInstance.get<Contact[]>(`/contacts/seeker/${seekerId}`)
    return data
  }
}

export default ContactService
