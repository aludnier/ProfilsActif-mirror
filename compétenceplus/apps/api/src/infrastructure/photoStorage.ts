import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/*
 * Écriture des photos de profil sur le disque. Pas de port/adaptateur ici :
 * `ports/` est réservé aux contrats qui ont plus d'une implémentation réelle,
 * et il n'y a qu'un stockage. Le jour où un second arrive (S3), c'est ce
 * fichier qui devient un adaptateur.
 */

/*
 * Chemin ancré sur ce fichier, jamais sur `process.cwd()` : l'API se lance
 * depuis `compétenceplus/` (npm run dev:api) comme depuis `apps/api/`, et un
 * chemin relatif au répertoire courant enverrait les fichiers à deux endroits
 * différents selon la commande utilisée.
 */
const RACINE_API = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOSSIER_PHOTOS = process.env.UPLOAD_DIR
  ? resolve(process.env.UPLOAD_DIR)
  : join(RACINE_API, 'uploads', 'photos');

export const TAILLE_MAX_PHOTO = 2 * 1024 * 1024;

/*
 * Le type est déduit des octets d'en-tête, pas de l'extension ni du
 * `Content-Type` annoncé : les deux se falsifient, un fichier renommé en
 * `.jpg` passerait. Ces trois formats couvrent ce que produisent un téléphone
 * et un navigateur.
 */
const SIGNATURES: { extension: string; mime: string; correspond: (o: Buffer) => boolean }[] = [
  {
    extension: 'jpg',
    mime: 'image/jpeg',
    correspond: (o) => o[0] === 0xff && o[1] === 0xd8 && o[2] === 0xff,
  },
  {
    extension: 'png',
    mime: 'image/png',
    correspond: (o) => o[0] === 0x89 && o[1] === 0x50 && o[2] === 0x4e && o[3] === 0x47,
  },
  {
    extension: 'webp',
    mime: 'image/webp',
    correspond: (o) =>
      o.subarray(0, 4).toString('ascii') === 'RIFF' &&
      o.subarray(8, 12).toString('ascii') === 'WEBP',
  },
];

export type FormatPhoto = { extension: string; mime: string };

/** Format réel du fichier, ou `null` si ce n'est pas une image acceptée. */
export function detecterFormat(octets: Buffer): FormatPhoto | null {
  const trouve = SIGNATURES.find((signature) => signature.correspond(octets));

  return trouve ? { extension: trouve.extension, mime: trouve.mime } : null;
}

/** Type MIME associé à un chemin déjà stocké. */
export function mimeDepuisChemin(chemin: string): string {
  const extension = chemin.split('.').pop() ?? '';

  return SIGNATURES.find((s) => s.extension === extension)?.mime ?? 'application/octet-stream';
}

/** Écrit la photo et renvoie son nom de fichier (jamais un chemin absolu). */
export async function enregistrerPhoto(octets: Buffer, format: FormatPhoto): Promise<string> {
  await mkdir(DOSSIER_PHOTOS, { recursive: true });
  const nom = `${randomUUID()}.${format.extension}`;
  await writeFile(join(DOSSIER_PHOTOS, nom), octets);

  return nom;
}

/*
 * Le nom vient de la base, mais on le revalide : une valeur trafiquée du type
 * `../../.env` sortirait du dossier. Seul un UUID suivi d'une extension connue
 * est accepté.
 */
const NOM_VALIDE = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export async function lirePhoto(nom: string): Promise<Buffer | null> {
  if (!NOM_VALIDE.test(nom)) return null;

  try {
    return await readFile(join(DOSSIER_PHOTOS, nom));
  } catch {
    /* Fichier effacé à la main, ou dossier absent après un clone : la base
       garde la trace mais l'image n'existe plus. */
    return null;
  }
}

export async function supprimerPhoto(nom: string): Promise<void> {
  if (!NOM_VALIDE.test(nom)) return;

  try {
    await unlink(join(DOSSIER_PHOTOS, nom));
  } catch {}
}
