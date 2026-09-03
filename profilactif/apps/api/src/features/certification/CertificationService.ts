import { NonTrouve } from '../../shared/errors.js'
import { CertificationRepository } from './CertificationRepository.js'
import type { CreateAttemptInput, CreateQuestionnaireVersionInput, UpdateAttemptInput } from './CertificationSchema.js'

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

  updateAttempt(id: string, seekerId: string, data: UpdateAttemptInput) {
    return this.repository.updateAttempt(id, seekerId, data).then((value) => {
      if (!value) throw new NonTrouve('Tentative introuvable', 'TENTATIVE_NON_TROUVEE')
      return value
    })
  }
}
