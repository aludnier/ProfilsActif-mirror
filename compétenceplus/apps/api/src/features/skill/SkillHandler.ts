import type { Context } from 'hono'
import {createSkillSchema, updateSkillSchema} from './SkillSchema.js'
import { SkillService } from './SkillService.js'
import { ValidationInvalide } from '../../shared/errors.js'
export class SkillHandler {constructor( private readonly skillService: SkillService) {}

  getAll = async (c: Context) => {const skills = await this.skillService.getAll()
    return c.json({
      data: skills,
    })
  }

  getById = async (c: Context) => {
    const id = this.getId(c)

    const skill = await this.skillService.getById(id)

    return c.json({
      data: skill,
    })
  }

  create = async (c: Context) => {
    const body = await c.req.json()

    const result = createSkillSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationInvalide(
        'Les données de la compétence sont invalides',
        'COMPETENCE_DONNEES_INVALIDES',
      )
    }

    const skill = await this.skillService.create(result.data)

    return c.json(
      {
        data: skill,
      },
      201,
    )
  }

  update = async (c: Context) => {
    const id = this.getId(c)
    const body = await c.req.json()

    const result = updateSkillSchema.safeParse(body)

    if (!result.success) {
      throw new ValidationInvalide(
        'Les données de la compétence sont invalides',
        'COMPETENCE_DONNEES_INVALIDES',
      )
    }

    const skill = await this.skillService.update(
      id,
      result.data,
    )

    return c.json({
      data: skill,
    })
  }

  delete = async (c: Context) => {
    const id = this.getId(c)

    await this.skillService.delete(id)

    return c.json({
      message: 'Compétence supprimée',
    })
  }

  private getId(c: Context): number {
    const id = Number(c.req.param('id'))

    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationInvalide(
        'L’identifiant est invalide',
        'ID_INVALIDE',
      )
    }

    return id
  }
}