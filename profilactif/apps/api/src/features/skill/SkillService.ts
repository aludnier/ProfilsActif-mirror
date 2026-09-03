import {Conflit, NonTrouve} from '../../shared/errors.js'
import {SkillRepository} from './SkillRepository.js'
import type {CreateSkillInput, UpdateSkillInput} from './SkillSchema.js'
export class SkillService {constructor( private readonly skillRepository: SkillRepository) {}

  async getAll() {
    return this.skillRepository.findAll()
  }

  async getById(id: number) {
    const skill = await this.skillRepository.findById(id)

    if (!skill) {
      throw new NonTrouve(
        'Compétence introuvable',
        'COMPETENCE_NON_TROUVEE',
      )
    }

    return skill
  }

  async create(data: CreateSkillInput) {
    const existingSkill =
      await this.skillRepository.findByName(data.name)

    if (existingSkill) {
      throw new Conflit(
        'Cette compétence existe déjà',
        'COMPETENCE_DEJA_EXISTANTE',
      )
    }

    const id = await this.skillRepository.create(data.name)

    return this.skillRepository.findById(id)
  }

  async update(id: number, data: UpdateSkillInput) {
    await this.getById(id)

    const existingSkill =
      await this.skillRepository.findByName(data.name)

    if (existingSkill && existingSkill.id !== id) {
      throw new Conflit(
        'Cette compétence existe déjà',
        'COMPETENCE_DEJA_EXISTANTE',
      )
    }

    await this.skillRepository.update(id, data.name)

    return this.skillRepository.findById(id)
  }

  async delete(id: number) {
    await this.getById(id)

    await this.skillRepository.delete(id)
  }
}