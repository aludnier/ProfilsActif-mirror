import { Hono } from 'hono';
import { Readable } from 'node:stream';

import { optionalAuth, type AuthVariables } from '../../infrastructure/auth.middleware.js';
import { NonTrouve } from '../../shared/errors.js';
import {
  fluxVideo,
  mimeVideoDepuisNom,
  nomVideoValide,
  tailleVideo,
} from '../../infrastructure/videoStorage.js';
import { VideoRepository } from './VideoRepository.js';

/*
 * Serving uploaded videos. Public on purpose — `videoRoutes` requires a token
 * for everything, which a <video> tag cannot send. Access is decided per file
 * instead: only a validated video is open to everyone.
 */
export const videoFileRoutes = new Hono<{ Variables: Partial<AuthVariables> }>();

const repository = new VideoRepository();

videoFileRoutes.get('/:nom', optionalAuth, async (c) => {
  const nom = c.req.param('nom');

  if (!nom || !nomVideoValide(nom)) throw new NonTrouve('Vidéo introuvable', 'VIDEO_NON_TROUVEE');

  const video = await repository.findByUrl(`/media/videos/${nom}`);
  if (!video) throw new NonTrouve('Vidéo introuvable', 'VIDEO_NON_TROUVEE');

  const utilisateur = c.get('user');
  const peutVoirAvantValidation =
    utilisateur !== undefined &&
    (utilisateur.role === 'admin' || utilisateur.id === video.seekerId);

  if (video.status !== 'approved' && !peutVoirAvantValidation) {
    throw new NonTrouve('Vidéo introuvable', 'VIDEO_NON_TROUVEE');
  }

  const taille = await tailleVideo(nom);
  if (taille === null) throw new NonTrouve('Fichier absent du disque', 'VIDEO_FICHIER_ABSENT');

  const type = mimeVideoDepuisNom(nom);
  const plage = c.req.header('range');

  /*
   * Without Range support the browser cannot seek, and Safari refuses to play
   * at all: it always asks for a byte range first.
   */
  if (plage) {
    const [debutBrut, finBrut] = plage.replace('bytes=', '').split('-');
    const debut = Number(debutBrut);
    const fin = finBrut ? Number(finBrut) : taille - 1;

    if (Number.isNaN(debut) || debut >= taille) {
      return c.body(null, 416, { 'Content-Range': `bytes */${taille}` });
    }

    const flux = Readable.toWeb(fluxVideo(nom, debut, fin)) as ReadableStream;
    return c.body(flux, 206, {
      'Content-Type': type,
      'Content-Length': String(fin - debut + 1),
      'Content-Range': `bytes ${debut}-${fin}/${taille}`,
      'Accept-Ranges': 'bytes',
    });
  }

  const flux = Readable.toWeb(fluxVideo(nom, 0, taille - 1)) as ReadableStream;
  return c.body(flux, 200, {
    'Content-Type': type,
    'Content-Length': String(taille),
    'Accept-Ranges': 'bytes',
  });
});
