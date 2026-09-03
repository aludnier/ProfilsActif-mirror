import axiosInstance from '@/shared/api-client'
import type { Skill } from '@/shared/types/api'

export class SkillService {
  static async getAllSkills(): Promise<Skill[]> {
    const { data } = await axiosInstance.get<Skill[]>('/skills')
    return data
  }

  static async getSkill(id: string): Promise<Skill> {
    const { data } = await axiosInstance.get<Skill>(`/skills/${id}`)
    return data
  }

  static async createSkill(name: string): Promise<Skill> {
    const { data } = await axiosInstance.post<Skill>('/skills', { name })
    return data
  }

  static async updateSkill(id: string, name: string): Promise<Skill> {
    const { data } = await axiosInstance.put<Skill>(`/skills/${id}`, { name })
    return data
  }

  static async deleteSkill(id: string): Promise<void> {
    await axiosInstance.delete(`/skills/${id}`)
  }
}

export default SkillService
