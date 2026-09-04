import axiosInstance from '@/shared/api-client'
import type { Interaction } from '@/shared/types/api'
export class InteractionService {
  static async createInteraction(type: string, fromUserId: string, toUserId: string): Promise<Interaction> {
    const { data } = await axiosInstance.post<Interaction>('/interactions', {
      type,
      fromUserId,
      toUserId,
    })
    return data
  }

  static async getInteractions(): Promise<Interaction[]> {
    const { data } = await axiosInstance.get<Interaction[]>('/interactions')
    return data
  }
}

export default InteractionService
