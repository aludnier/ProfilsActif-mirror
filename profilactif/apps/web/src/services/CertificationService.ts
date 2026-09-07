import axiosInstance from '@/shared/api-client'
import type { AttemptUpdateResult, Questionnaire, QuestionnaireAttempt } from '@/shared/types/api'

export class CertificationService {

  static async getPublished(): Promise<Questionnaire> {
    const { data } = await axiosInstance.get<Questionnaire>('/certifications')
    return data
  }

  static async getById(id: string): Promise<Questionnaire> {
    const { data } = await axiosInstance.get<Questionnaire>(`/certifications/${id}`)
    return data
  }

  static async createAttempt(
    questionnaireVersionId: string,
    answers: Record<string, string[]> = {},
  ): Promise<QuestionnaireAttempt> {
    const { data } = await axiosInstance.post<QuestionnaireAttempt>('/certifications/attempts', {
      questionnaireVersionId,
      answers,
    })
    return data
  }

  static async getAttempt(id: string): Promise<QuestionnaireAttempt> {
    const { data } = await axiosInstance.get<QuestionnaireAttempt>(`/certifications/attempts/${id}`)
    return data
  }

  static async updateAttempt(
    id: string,
    answers: Record<string, string[]>,
    status?: QuestionnaireAttempt['status'],
  ): Promise<AttemptUpdateResult> {
    const { data } = await axiosInstance.patch<AttemptUpdateResult>(
      `/certifications/attempts/${id}`,
      { answers, status },
    )
    return data
  }
}

export default CertificationService
