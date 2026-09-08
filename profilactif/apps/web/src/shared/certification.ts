/**
 * Barème d'affichage du badge de certification, aligné sur le `content` du
 * questionnaire semé (migrations/seed.sql) : seuil de réussite à 70, bandes
 * débutant / intermédiaire / senior.
 *
 * L'API renvoie `certificationRate` (0–100) sur le profil ; on en dérive le
 * badge ici plutôt que d'appeler le questionnaire.
 */

export const SEUIL_CERTIFICATION = 70

const BANDES: { min: number; niveau: string }[] = [
  { min: 90, niveau: 'senior' },
  { min: 80, niveau: 'intermédiaire' },
  { min: 70, niveau: 'débutant' },
]

/** `true` dès que le seuil de validation est atteint. */
export function estCertifie(taux: number): boolean {
  return taux >= SEUIL_CERTIFICATION
}

/** Niveau de badge pour un taux (0–100), ou `null` si le seuil n'est pas atteint. */
export function niveauBadge(taux: number): string | null {
  for (const bande of BANDES) {
    if (taux >= bande.min) return bande.niveau
  }
  return null
}
