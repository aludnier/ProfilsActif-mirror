import axiosInstance from '@/shared/api-client'
import type { Video } from '@/shared/types/api'

export class VideoService {
  static async createVideo(seekerId: string, url: string, title?: string | null, description?: string | null): Promise<Video> {
    const { data } = await axiosInstance.post<Video>('/videos', {
      seekerId,
      url,
      title,
      description,
    })
    return data
  }

  static async getVideo(id: string): Promise<Video> {
    const { data } = await axiosInstance.get<Video>(`/videos/${id}`)
    return data
  }

  static async updateVideo(id: string, updates: Partial<Omit<Video, 'id' | 'seekerId' | 'createdAt' | 'updatedAt'>>): Promise<Video> {
    const { data } = await axiosInstance.patch<Video>(`/videos/${id}`, updates)
    return data
  }

  static async deleteVideo(id: string): Promise<void> {
    await axiosInstance.delete(`/videos/${id}`)
  }

  static async getVideosBySeeker(seekerId: string): Promise<Video[]> {
    const { data } = await axiosInstance.get<Video[]>(`/videos/seeker/${seekerId}`)
    return data
  }
}

export default VideoService
