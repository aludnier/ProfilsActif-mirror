import { Conflit, NonTrouve, ValidationInvalide } from '../../shared/errors.js'
import { CertificationRepository, type QuestionnaireAttempt } from './CertificationRepository.js'
import type {
  CreateAttemptInput,
  CreateQuestionnaireVersionInput,
  UpdateAttemptInput,
} from './CertificationSchema.js'
import { parseQuestionnaire, QuestionnaireInvalide } from './domain/Questionnaire.js'
import { computeScore, type ScoreResult } from './domain/Score.js'

function versValidation(error: unknown, prefixe: string): never {
  if (error instanceof QuestionnaireInvalide) {
    throw new ValidationInvalide(`${prefixe} : ${error.message}`, 'QUESTIONNAIRE_INVALIDE')
  }
  throw error
}

export class CertificationService {
  constructor(private readonly repository = new CertificationRepository()) {}

  getPublished() {
    return this.repository.getPublished().then((value) => {
      if (!value) throw new NonTrouve('Aucun questionnaire publié', 'QUESTIONNAIRE_NON_TROUVE')
      return value
    })
  }

  getVersion(id: string) {
    return this.repository.getVersion(id).then((value) => {
      if (!value) throw new NonTrouve('Questionnaire introuvable', 'QUESTIONNAIRE_NON_TROUVE')
      return value
    })
  }

  createQuestionnaire(data: CreateQuestionnaireVersionInput, userId: string) {
    try {
      parseQuestionnaire(data.content)
    } catch (error) {
      versValidation(error, 'Questionnaire invalide')
    }
    return this.repository.createVersion(data, userId)
  }

  publishQuestionnaire(id: string) {
    return this.repository.publishVersion(id).then((value) => {
      if (!value) throw new NonTrouve('Questionnaire introuvable', 'QUESTIONNAIRE_NON_TROUVE')
      return value
    })
  }

  async createAttempt(data: CreateAttemptInput, seekerId: string) {
    await this.getVersion(data.questionnaireVersionId)
    return this.repository.createAttempt(data, seekerId)
  }

  getAttempt(id: string, seekerId: string) {
    return this.repository.getAttempt(id, seekerId).then((value) => {
      if (!value) throw new NonTrouve('Tentative introuvable', 'TENTATIVE_NON_TROUVEE')
      return value
    })
  }

  async updateAttempt(
    id: string,
    seekerId: string,
    data: UpdateAttemptInput,
  ): Promise<QuestionnaireAttempt & { result?: ScoreResult }> {
    const attempt = await this.getAttempt(id, seekerId)
    if (attempt.status === 'submitted') {
      throw new Conflit('Cette tentative a déjà été soumise', 'TENTATIVE_DEJA_SOUMISE')
    }

    if (data.status !== 'submitted') {
      const saved = await this.repository.updateAttempt(id, seekerId, data)
      if (!saved) throw new NonTrouve('Tentative introuvable', 'TENTATIVE_NON_TROUVEE')
      return saved
    }

    const version = await this.getVersion(attempt.questionnaireVersionId)

    let questionnaire
    try {
      questionnaire = parseQuestionnaire(version.content)
    } catch (error) {
      versValidation(error, 'Questionnaire publié invalide')
    }

    const result = computeScore(questionnaire, data.answers)
    const saved = await this.repository.submitAttempt(id, seekerId, data.answers, result.score)
    if (!saved) throw new NonTrouve('Tentative introuvable', 'TENTATIVE_NON_TROUVEE')

    return { ...saved, result }
  }
}
