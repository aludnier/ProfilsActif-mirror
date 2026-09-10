import { NonTrouve } from '../../shared/errors.js'
import { RecruiterRepository } from './RecruiterRepository.js'
import type { UpdateRecruiterInput } from './RecruiterSchema.js'

export class RecruiterService {
  constructor(
    private readonly recruiterRepository =
      new RecruiterRepository(),
  ) {}

  async getRecruiter(id: string) {
    const recruiter =
      await this.recruiterRepository.findById(id)

    if (!recruiter) {
      throw new NonTrouve(
        'Recruteur introuvable',
        'RECRUTEUR_NON_TROUVE',
      )
    }

    return recruiter
  }

  async updateRecruiter(
    id: string,
    data: UpdateRecruiterInput,
  ) {
    await this.getRecruiter(id)

    await this.recruiterRepository.update(id, data)

    return this.getRecruiter(id)
  }
}