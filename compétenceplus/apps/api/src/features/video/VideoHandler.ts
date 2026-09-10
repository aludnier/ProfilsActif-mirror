import type { Context } from 'hono'
import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { Interdit, ValidationInvalide } from '../../shared/errors.js'
import { VideoService } from './VideoService.js'
import {createVideoSchema, updateVideoSchema} from './VideoSchema.js'
import {
  detecterFormatVideo,
  enregistrerVideo,
  TAILLE_MAX_VIDEO,
} from '../../infrastructure/videoStorage.js'

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

/*
 * Uploading a video file. The row keeps a relative URL (`/media/videos/…`) so
 * the database never hardcodes a hostname; the front prefixes it.
 */
export async function uploadVideoHandler(c: Context) {
  const body = await c.req.parseBody()
  const fichier = body['video']
  const seekerId = String(body['seekerId'] ?? '')

  const user = c.get('user') as AuthVariables['user']
  if (user.role !== 'admin' && user.id !== seekerId) {
    throw new Interdit()
  }

  if (!(fichier instanceof File)) {
    throw new ValidationInvalide('Aucun fichier reçu (champ « video »)', 'VIDEO_ABSENTE')
  }

  if (fichier.size > TAILLE_MAX_VIDEO) {
    throw new ValidationInvalide('Vidéo trop lourde : 100 Mo maximum', 'VIDEO_TROP_LOURDE')
  }

  const octets = Buffer.from(await fichier.arrayBuffer())
  const format = detecterFormatVideo(octets)

  if (format === null) {
    throw new ValidationInvalide(
      'Format non reconnu : seuls MP4 et WebM sont acceptés',
      'VIDEO_FORMAT_INVALIDE',
    )
  }

  const nom = await enregistrerVideo(octets, format)

  return c.json(
    await videoService.createVideo({
      seekerId,
      url: `/media/videos/${nom}`,
      title: typeof body['title'] === 'string' ? body['title'] : null,
      description: null,
    }),
    201,
  )
}

