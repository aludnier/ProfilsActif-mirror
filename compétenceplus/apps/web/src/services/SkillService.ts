import axiosInstance from '@/shared/api-client';
import type { Skill } from '@/shared/types/api';

/*
 * Unlike /profiles and /videos, every /skills route wraps its payload in a
 * `data` envelope (see SkillHandler on the API side). Unwrapping it here keeps
 * the difference from leaking into the components.
 */
interface Enveloppe<T> {
  data: T;
}

export class SkillService {
  static async getAllSkills(): Promise<Skill[]> {
    const { data } = await axiosInstance.get<Enveloppe<Skill[]>>('/skills');
    return data.data;
  }

  static async getSkill(id: string): Promise<Skill> {
    const { data } = await axiosInstance.get<Enveloppe<Skill>>(`/skills/${id}`);
    return data.data;
  }

  static async createSkill(name: string): Promise<Skill> {
    const { data } = await axiosInstance.post<Enveloppe<Skill>>('/skills', { name });
    return data.data;
  }

  static async updateSkill(id: string, name: string): Promise<Skill> {
    const { data } = await axiosInstance.put<Enveloppe<Skill>>(`/skills/${id}`, { name });
    return data.data;
  }

  static async deleteSkill(id: string): Promise<void> {
    await axiosInstance.delete(`/skills/${id}`);
  }
}

export default SkillService;
