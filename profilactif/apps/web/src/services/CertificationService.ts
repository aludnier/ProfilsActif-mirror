import axiosInstance from '@/shared/api-client'

export interface CertificationQuestion {
  id: string
  text: string
  type?: 'text' | 'choice' | 'scale' | 'yes_no'
  options?: string[]
}

export interface QuestionnaireVersion {
  id: string
  code: string
  title: string
  version: number
  content: { questions?: CertificationQuestion[] }
}

export interface QuestionnaireAttempt {
  id: string
  questionnaireVersionId: string
  answers: Record<string, unknown>
  status: 'in_progress' | 'submitted' | 'abandoned'
  score: number | null
}

export default class CertificationService {
  static async getPublished() {
    const { data } = await axiosInstance.get<QuestionnaireVersion>('/certifications')
    return data
  }

  static async createAttempt(questionnaireVersionId: string, answers = {}) {
    const { data } = await axiosInstance.post<QuestionnaireAttempt>('/certifications/attempts', { questionnaireVersionId, answers })
    return data
  }

  static async getAttempt(id: string) {
    const { data } = await axiosInstance.get<QuestionnaireAttempt>(`/certifications/attempts/${id}`)
    return data
  }

  static async updateAttempt(id: string, answers: Record<string, unknown>, status?: QuestionnaireAttempt['status']) {
    const { data } = await axiosInstance.patch<QuestionnaireAttempt>(`/certifications/attempts/${id}`, { answers, status })
    return data
  }
}

