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
      if (!value) {
        console.log("invalid return get")
        throw new NonTrouve('Questionnaire introuvable', 'QUESTIONNAIRE_NON_TROUVE')
      }
      return value
    })
  }

  getDraft() {
    return this.repository.getDraft().then((value) => {
      if (!value) {
        return null
      }
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
      if (!value) {
        throw new NonTrouve('Questionnaire introuvable', 'QUESTIONNAIRE_NON_TROUVE')
      }
      return value
    })
  }

  publishQuestionnaireDraft(id: string) {
    return this.repository.saveDraft(id).then((value) => {
      if (!value) {
        throw null
      }
      return value
    })
  }


  async createAttempt(data: CreateAttemptInput, seekerId: string) {
    const version = await this.getVersion(data.questionnaireVersionId)
    await this.verifierDelaiReprise(version, seekerId)

    return this.repository.createAttempt(data, seekerId)
  }

  getLastSubmittedAttempt(seekerId: string) {
    return this.repository.getLastSubmittedAttempt(seekerId)
  }

  /*
   * `retakeDelayDays` was parsed and validated but never enforced: a candidate
   * could retake immediately whatever the questionnaire said.
   */
  private async verifierDelaiReprise(
    version: { content: unknown },
    seekerId: string,
  ): Promise<void> {
    let questionnaire
    try {
      questionnaire = parseQuestionnaire(version.content)
    } catch {
      /* An unreadable version is rejected later, when scoring. */
      return
    }

    const jours = questionnaire.config.retakeDelayDays
    if (jours <= 0) return

    const derniere = await this.repository.getLastSubmittedAttempt(seekerId)
    if (!derniere?.submittedAt) return

    const rouvertLe = new Date(derniere.submittedAt).getTime() + jours * 24 * 60 * 60 * 1000
    if (Date.now() >= rouvertLe) return

    throw new Conflit(
      `Vous pourrez repasser le test à partir du ${new Date(rouvertLe).toLocaleDateString('fr-FR')}.`,
      'DELAI_REPRISE_NON_ECOULE',
    )
  }

  /* `null` et non une erreur : n'avoir aucune tentative en cours est le cas normal. */
  getCurrentAttempt(seekerId: string) {
    return this.repository.getCurrentAttempt(seekerId)
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
