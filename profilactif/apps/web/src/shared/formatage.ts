/** Narrow no-break space (U+202F) produced by `toLocaleString('fr-FR')`. */
const ESPACE_FINE_INSECABLE = / /g;

/** Regular no-break space (U+00A0). */
const ESPACE_INSECABLE = ' ';

/** Formats an integer with a visible thousands separator. */
export function formaterNombre(valeur: number): string {
  return valeur.toLocaleString('fr-FR').replace(ESPACE_FINE_INSECABLE, ESPACE_INSECABLE);
}
