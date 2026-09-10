import { API_URL } from '@/shared/api-client';


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
