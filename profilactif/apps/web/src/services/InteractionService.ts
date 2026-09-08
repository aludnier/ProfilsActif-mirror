import axiosInstance from '@/shared/api-client'
import type { AppNotification } from '@/shared/types/api'

export class InteractionService {
  static async listNotifications(unreadOnly = false): Promise<AppNotification[]> {
    const { data } = await axiosInstance.get<AppNotification[]>('/interactions/notifications', {
      params: unreadOnly ? { unread: 'true' } : undefined,
    })
    return data
  }

  static async unreadCount(): Promise<number> {
    const { data } = await axiosInstance.get<{ count: number }>(
      '/interactions/notifications/unread-count',
    )
    return data.count
  }

  static async markRead(id: string): Promise<void> {
    await axiosInstance.patch(`/interactions/notifications/${id}/read`)
  }

  static async markAllRead(): Promise<void> {
    await axiosInstance.post('/interactions/notifications/read-all')
  }
}

export default InteractionService
