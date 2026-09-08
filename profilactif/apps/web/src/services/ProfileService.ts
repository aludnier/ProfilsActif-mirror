import axiosInstance from '@/shared/api-client'
import type { Profile, UpdateProfileInput } from '@/shared/types/api'

export class ProfileService {
  static async getProfiles(): Promise<Profile[]> {
    const { data } = await axiosInstance.get<Profile[]>('/profiles')
    return Promise.all(
      data.map(async (profile) => ({
        ...profile,
        competences: await this.getCompetences(profile.id).catch(() => []),
      })),
    )
  }

  static async getProfile(id: string): Promise<Profile> {
    const { data } = await axiosInstance.get<Profile>(`/profiles/${id}`)
    return data
  }

  static async updateProfile(id: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data } = await axiosInstance.patch<Profile>(`/profiles/${id}`, updates)
    return data
  }
  static async getCompetences(id: string): Promise<string[]> {
    const { data } = await axiosInstance.get<{ competences: string[] }>('/profiles/' + id + '/competences')
    return data.competences
  }

  static async updateCompetences(id: string, competences: string[]): Promise<string[]> {
    const { data } = await axiosInstance.put<{ competences: string[] }>('/profiles/' + id + '/competences', { competences })
    return data.competences
  }

}

export default ProfileService
