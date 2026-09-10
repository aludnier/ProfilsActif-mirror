import { randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Same layout as photoStorage: files on disk, only the name in the database.
const RACINE_API = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DOSSIER_VIDEOS = process.env.UPLOAD_VIDEO_DIR
  ? resolve(process.env.UPLOAD_VIDEO_DIR)
  : join(RACINE_API, 'uploads', 'videos');

export const TAILLE_MAX_VIDEO = 100 * 1024 * 1024;

type Signature = { extension: string; mime: string; correspond: (o: Buffer) => boolean };

// Detected from the leading bytes, never from the extension.
const SIGNATURES: Signature[] = [
  {
    extension: 'mp4',
    mime: 'video/mp4',
    // MP4/MOV: the box size comes first, then "ftyp" at offset 4.
    correspond: (o) => o.subarray(4, 8).toString('ascii') === 'ftyp',
  },
  {
    extension: 'webm',
    mime: 'video/webm',
    correspond: (o) => o[0] === 0x1a && o[1] === 0x45 && o[2] === 0xdf && o[3] === 0xa3,
  },
];

export type FormatVideo = { extension: string; mime: string };

export function detecterFormatVideo(octets: Buffer): FormatVideo | null {
  const trouve = SIGNATURES.find((signature) => signature.correspond(octets));

  return trouve ? { extension: trouve.extension, mime: trouve.mime } : null;
}

export function mimeVideoDepuisNom(nom: string): string {
  const extension = nom.split('.').pop() ?? '';

  return SIGNATURES.find((s) => s.extension === extension)?.mime ?? 'application/octet-stream';
}

export async function enregistrerVideo(octets: Buffer, format: FormatVideo): Promise<string> {
  await mkdir(DOSSIER_VIDEOS, { recursive: true });
  const nom = `${randomUUID()}.${format.extension}`;
  await writeFile(join(DOSSIER_VIDEOS, nom), octets);

  return nom;
}

// Re-validated on read: a tampered name like `../../.env` must not escape.
const NOM_VALIDE = /^[0-9a-f-]{36}\.(mp4|webm)$/;

export function nomVideoValide(nom: string): boolean {
  return NOM_VALIDE.test(nom);
}

export function cheminVideo(nom: string): string {
  return join(DOSSIER_VIDEOS, nom);
}

export async function tailleVideo(nom: string): Promise<number | null> {
  if (!nomVideoValide(nom)) return null;

  try {
    return (await stat(cheminVideo(nom))).size;
  } catch {
    return null;
  }
}

/*
 * Read by chunks: a 100 MB file must never be loaded whole to answer a seek.
 * `fin` is inclusive, as in the Range header.
 */
export function fluxVideo(nom: string, debut: number, fin: number) {
  return createReadStream(cheminVideo(nom), { start: debut, end: fin });
}

export async function supprimerVideo(nom: string): Promise<void> {
  if (!nomVideoValide(nom)) return;

  try {
    await unlink(cheminVideo(nom));
  } catch {
    // Already gone: nothing to do.
  }
}
