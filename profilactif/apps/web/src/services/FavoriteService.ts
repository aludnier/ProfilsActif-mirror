import axiosInstance from '@/shared/api-client'
import type { Favorite } from '@/shared/types/api'

export class FavoriteService {
  static async createFavorite(seekerId: string): Promise<Favorite> {
    const { data } = await axiosInstance.post<Favorite>('/favorites', { seekerId })
    return data
  }

  static async getFavoritesByRecruiter(recruiterId: string): Promise<Favorite[]> {
    const { data } = await axiosInstance.get<Favorite[]>(`/favorites/recruiter/${recruiterId}`)
    return data
  }

  static async deleteFavorite(id: string): Promise<void> {
    await axiosInstance.delete(`/favorites/${id}`)
  }
}

export default FavoriteService
