import axiosInstance from '@/shared/api-client'
import type { PublicUser, Video } from '@/shared/types/api'

export interface AdminUserPage {
  data: PublicUser[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export default class AdminService {
  static async getUsers(search = ''): Promise<AdminUserPage> {
    const { data } = await axiosInstance.get<AdminUserPage>('/admin/users', { params: { search, limit: 100 } })
    return data
  }

  static async updateUserProfile(id: string, input: { firstName?: string; lastName?: string; phone?: string | null; mail?: string }): Promise<PublicUser> {
    const { data } = await axiosInstance.patch<PublicUser>('/admin/users/' + id + '/profile', input)
    return data
  }

  static async updateUserRole(id: string, role: 'seeker' | 'recruiter' | 'admin'): Promise<PublicUser> {
    const { data } = await axiosInstance.patch<PublicUser>('/admin/users/' + id + '/role', { role })
    return data
  }

  static async updateUserStatus(id: string, status: 'active' | 'suspended' | 'deleted'): Promise<PublicUser> {
    const { data } = await axiosInstance.patch<PublicUser>('/admin/users/' + id + '/status', { status })
    return data
  }

  static async deleteUser(id: string): Promise<void> {
    await axiosInstance.delete('/admin/users/' + id)
  }

  static async getPendingVideos(): Promise<Video[]> {
    const { data } = await axiosInstance.get<Video[]>('/admin/videos/pending')
    return data
  }

  static async moderateVideo(id: string, status: 'approved' | 'rejected', reason?: string): Promise<Video> {
    const { data } = await axiosInstance.patch<Video>('/admin/videos/' + id + '/status', { status, reason: reason || null })
    return data
  }
}
