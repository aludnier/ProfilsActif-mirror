import { Hono } from 'hono'

import { SkillHandler } from './SkillHandler.js'
import { SkillRepository } from './SkillRepository.js'
import { SkillService } from './SkillService.js'

const repository = new SkillRepository()
const service = new SkillService(repository)
const handler = new SkillHandler(service)

export const skillRoutes = new Hono()

skillRoutes.get('/', handler.getAll)
skillRoutes.get('/:id', handler.getById)

skillRoutes.post('/', handler.create)

skillRoutes.put('/:id', handler.update)

skillRoutes.delete('/:id', handler.delete)