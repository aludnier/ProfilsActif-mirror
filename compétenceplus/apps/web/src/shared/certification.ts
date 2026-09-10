/**
 * Barème d'affichage du badge de certification.
 *
 * L'API renvoie `certificationRate` (0–100) sur le profil ; on en dérive le
 * badge ici plutôt que d'appeler le questionnaire.
 *
 * Ces valeurs doublent celles de la version publiée
 * (`migrations/questionnaire-aptitudes.json`, config `passThreshold` et
 * `badgeBands`) : les deux doivent bouger ensemble. Désaccordées, l'écran de
 * résultat et les cartes de profil se contredisent sur le même candidat.
 */

export const SEUIL_CERTIFICATION = 50

const BANDES: { min: number; niveau: string }[] = [
  { min: 85, niveau: 'avancée' },
  { min: 70, niveau: 'intermédiaire' },
  { min: 50, niveau: 'initiale' },
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
