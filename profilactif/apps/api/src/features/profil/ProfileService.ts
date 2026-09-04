import { NonTrouve } from '../../shared/errors.js'
import { ProfilRepository } from './ProfilRepository.js'
import type { UpdateProfilInput } from './ProfilSchema.js'

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
}
