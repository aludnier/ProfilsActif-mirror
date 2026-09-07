import axiosInstance from '@/shared/api-client'
import type { AttemptUpdateResult, Questionnaire, QuestionnaireAttempt, QuestionAttemp, QuestionnaireContent, } from '@/shared/types/api'

export class CertificationService {

  static async getPublished(): Promise<Questionnaire> {
    const { data } = await axiosInstance.get<Questionnaire>('/certifications')
    return data
  }

  static async getDraft(): Promise<Questionnaire> {
    const { data } = await axiosInstance.get<Questionnaire>('/certifications/draft')
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
  
  static async createQuestion(
    question: string,
    responses: string[],
    weight: number,
    type: 'single' | 'multiple',
  ): Promise<QuestionAttemp> {
    const { data } = await axiosInstance.post<QuestionAttemp>('/certifications/questions', {
      question,
      responses,
      weight,
      type,
    })
    return data
  }

  static async createQuestionnaire(
    code:string,
    title:string,
    content: QuestionnaireContent
  ) {
    const {data} = await axiosInstance.post<Questionnaire>('/certifications', {
      code,
      title,
      content
    });
    return data
  }

  static async publishQuestionnaire(id: string): Promise<Questionnaire> {
    const { data } = await axiosInstance.post<Questionnaire>(`/certifications/${id}/publish`)
    return data
  }
  
  static async publishQuestionnaireDraft(id: string): Promise<Questionnaire> {
    const { data } = await axiosInstance.post<Questionnaire>(`/certifications/${id}/draft`)
    return data
  }

}

export default CertificationService
