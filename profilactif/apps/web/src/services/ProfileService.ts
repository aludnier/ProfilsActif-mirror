import axiosInstance from '@/shared/api-client'
import type { Profile, UpdateProfileInput } from '@/shared/types/api'

export class ProfileService {
  static async getProfile(id: string): Promise<Profile> {
    const { data } = await axiosInstance.get<Profile>(`/profiles/${id}`)
    return data
  }

  static async updateProfile(id: string, updates: UpdateProfileInput): Promise<Profile> {
    const { data } = await axiosInstance.patch<Profile>(`/profiles/${id}`, updates)
    return data
  }
}

export default ProfileService
