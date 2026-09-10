import { NonTrouve, ValidationInvalide } from '../../shared/errors.js'
import { detecterFormat, enregistrerPhoto, supprimerPhoto } from '../../infrastructure/photoStorage.js'
import { ProfilRepository } from './ProfilRepository.js'
import type { UpdateCompetencesInput, UpdateProfilInput } from './ProfilSchema.js'

export class ProfileService {constructor(private readonly profilRepository = new ProfilRepository()) {}

  async getProfils() {
    return this.profilRepository.findAll()
  }


  async getProfilsPage(filters: {
    page: number
    limit: number
    secteur?: string
    localisation?: string
    competences?: string[]
    niveau?: string
    types?: string[]
    modalites?: string[]
    certification?: string
    contratDu?: string
    contratAu?: string
  }) {
    return this.profilRepository.findPage(filters)
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

  async recordConsultation(seekerId: string, recruiterId: string): Promise<void> {
    await this.profilRepository.recordConsultation(seekerId, recruiterId)
  }

  async getConsultations(seekerId: string) {
    await this.getProfil(seekerId)
    return this.profilRepository.findConsultations(seekerId)
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



  /* --- Photo de profil --------------------------------------------------- */

  async getPhoto(id: string) {
    return this.profilRepository.findPhoto(id)
  }

  /*
   * Remplacer une photo efface l'ancienne : sans ça, chaque essai laisserait
   * un fichier orphelin que plus rien ne référence.
   */
  async remplacerPhoto(id: string, octets: Buffer) {
    const format = detecterFormat(octets)

    if (format === null) {
      throw new ValidationInvalide(
        'Format non reconnu : seuls JPEG, PNG et WebP sont acceptés',
        'PHOTO_FORMAT_INVALIDE',
      )
    }

    const profil = await this.profilRepository.findById(id)
    if (!profil) throw new NonTrouve('Profil introuvable', 'PROFIL_NON_TROUVE')

    const precedente = await this.profilRepository.findPhoto(id)
    const nom = await enregistrerPhoto(octets, format)
    await this.profilRepository.updatePhoto(id, nom)

    if (precedente?.path) await supprimerPhoto(precedente.path)

    return { path: nom, status: 'pending' as const }
  }

  async supprimerPhotoProfil(id: string) {
    const photo = await this.profilRepository.findPhoto(id)
    if (!photo?.path) throw new NonTrouve('Aucune photo à supprimer', 'PHOTO_NON_TROUVEE')

    await this.profilRepository.clearPhoto(id)
    await supprimerPhoto(photo.path)
  }
}
