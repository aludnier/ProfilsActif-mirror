import { NonTrouve } from '../../shared/errors.js'
import { ProfilRepository } from './ProfilRepository.js'
import type { UpdateCompetencesInput, UpdateProfilInput } from './ProfilSchema.js'

export class ProfileService {constructor(private readonly profilRepository = new ProfilRepository()) {}

  async getProfils() {
    return this.profilRepository.findAll()
  }

  async getProfil(id: string) {
    const profil = await this.profilRepository.findById(id)

    if (!profil) {
      throw new NonTrouve(
        'Profil introuvable',
        'PROFIL_NON_TROUVE',
      )
    }

    return profil
  }

  async updateProfil(
    id: string,
    data: UpdateProfilInput,
  ) {
    const profil = await this.profilRepository.findById(id)

    if (!profil) {
      throw new NonTrouve(
        'Profil introuvable',
        'PROFIL_NON_TROUVE',
      )
    }

    await this.profilRepository.update(id, data)

    return this.profilRepository.findById(id)
  }
  async getCompetences(id: string) {
    await this.getProfil(id)
    return this.profilRepository.findCompetences(id)
  }

  async updateCompetences(id: string, data: UpdateCompetencesInput) {
    await this.getProfil(id)
    await this.profilRepository.replaceCompetences(id, data)
    return this.profilRepository.findCompetences(id)
  }


}
