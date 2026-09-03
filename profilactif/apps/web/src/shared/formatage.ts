/** Espace fine insécable (U+202F), produite par `toLocaleString('fr-FR')`. */
const ESPACE_FINE_INSECABLE = / /g;

/** Espace insécable ordinaire (U+00A0). */
const ESPACE_INSECABLE = ' ';

/**
 * Formate un entier avec un séparateur de milliers visible.
 *
 * `toLocaleString('fr-FR')` sépare les milliers par une espace fine insécable,
 * qui est la forme prescrite en typographie française mais que Marianne rend
 * avec une chasse quasi nulle : « 1 284 » s'affiche « 1284 » et le séparateur
 * ne remplit plus son rôle. On la remplace par une espace insécable ordinaire,
 * visible et tout aussi insécable.
 */
export function formaterNombre(valeur: number): string {
  return valeur.toLocaleString('fr-FR').replace(ESPACE_FINE_INSECABLE, ESPACE_INSECABLE);
}
