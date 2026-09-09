import { API_URL } from '@/shared/api-client';

/*
 * L'image n'est pas servie par un dossier statique mais par une route de
 * l'API, qui décide seule de sa visibilité : une photo en attente ou refusée
 * n'est renvoyée qu'à son propriétaire ou à un administrateur.
 *
 * Conséquence directe sur l'affichage, et c'est le piège de ce module :
 * une balise `<img src="…">` n'envoie **pas** l'en-tête `Authorization`, le
 * jeton vivant dans le localStorage. Cette URL ne convient donc qu'aux photos
 * déjà validées, visibles sans authentification.
 *
 * Pour afficher une photo en attente — son propre profil, la file de
 * modération — il faut passer par `ProfileService.getPhotoBlob()`, qui va la
 * chercher via axios (donc avec le jeton) et rend une URL d'objet locale.
 */
export function urlPhotoProfil(seekerId: string): string {
  return `${API_URL}/profiles/${seekerId}/photo`;
}

/** `true` seulement si la photo est validée, donc affichable par tout le monde. */
export function photoValidee(statut: string | null | undefined): boolean {
  return statut === 'approved';
}

export const LIBELLES_STATUT_PHOTO: Record<string, string> = {
  pending: 'En attente de validation',
  approved: 'Validée',
  rejected: 'Refusée',
};
