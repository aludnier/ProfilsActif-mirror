import axiosInstance from '@/shared/api-client'
import type { Recruiter, UpdateProfileInput } from '@/shared/types/api'

export class RecruiterService {
  static async getRecruiter(id: string): Promise<Recruiter> {
    const { data } = await axiosInstance.get<Recruiter>(`/recruiters/${id}`)
    return data
  }

  static async updateRecruiter(id: string, updates: UpdateProfileInput & { companyName?: string; companyLocation?: string }): Promise<Recruiter> {
    const { data } = await axiosInstance.patch<Recruiter>(`/recruiters/${id}`, updates)
    return data
  }
}

export default RecruiterService
