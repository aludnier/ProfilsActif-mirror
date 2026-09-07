import type { Context } from 'hono'
import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { Interdit, ValidationInvalide } from '../../shared/errors.js'
import { VideoService } from './VideoService.js'
import {createVideoSchema, updateVideoSchema} from './VideoSchema.js'

const videoService = new VideoService()

export async function getVideoHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de vidéo invalide',
      'VIDEO_ID_INVALIDE',
    )
  }

  return c.json(await videoService.getVideo(id))
}

export async function getVideosBySeekerHandler(c: Context) {
  const seekerId = c.req.param('seekerId')

  if (!seekerId) {
    throw new ValidationInvalide(
      'Identifiant du seeker invalide',
      'SEEKER_ID_INVALIDE',
    )
  }

  return c.json(
    await videoService.getVideosBySeeker(seekerId, (() => { const user = c.get('user') as AuthVariables['user']; return user.id === seekerId || user.role === 'admin' })()),
  )
}

export async function createVideoHandler(c: Context) {
  const body = await c.req.json()
  const result = createVideoSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données de vidéo invalides',
      'VIDEO_DONNEES_INVALIDES',
    )
  }

  const user = c.get('user') as AuthVariables['user']
  if (user.role !== 'admin' && user.id !== result.data.seekerId) {
    throw new Interdit()
  }

  return c.json(
    await videoService.createVideo(result.data),
    201,
  )
}

export async function updateVideoHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de vidéo invalide',
      'VIDEO_ID_INVALIDE',
    )
  }

  const body = await c.req.json()
  const result = updateVideoSchema.safeParse(body)

  if (!result.success) {
    throw new ValidationInvalide(
      'Données de vidéo invalides',
      'VIDEO_DONNEES_INVALIDES',
    )
  }

  const existing = await videoService.getVideo(id)
  const user = c.get('user') as AuthVariables['user']
  if (user.role !== 'admin' && user.id !== existing.seekerId) {
    throw new Interdit()
  }

  return c.json(
    await videoService.updateVideo(id, result.data),
  )
}

export async function deleteVideoHandler(c: Context) {
  const id = c.req.param('id')

  if (!id) {
    throw new ValidationInvalide(
      'Identifiant de vidéo invalide',
      'VIDEO_ID_INVALIDE',
    )
  }

  const existing = await videoService.getVideo(id)
  const user = c.get('user') as AuthVariables['user']
  if (user.role !== 'admin' && user.id !== existing.seekerId) {
    throw new Interdit()
  }

  await videoService.deleteVideo(id)

  return c.body(null, 204)
}