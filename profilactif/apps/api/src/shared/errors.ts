
import type { ErrorHandler } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class ErreurApp extends Error {
  constructor(
    readonly statut: ContentfulStatusCode,
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = new.target.name
  }
}

// aucun jeton, jeton invalide, ou identifiants incorrects.
export class NonAuthentifie extends ErreurApp {
  constructor(message = "Authentification requise", code = 'NON_AUTHENTIFIE') {
    super(401, code, message)
  }
}

// authentifié, mais le rôle ne permet pas l'action.
export class Interdit extends ErreurApp {
  constructor(message = 'Accès refusé', code = 'INTERDIT') {
    super(403, code, message)
  }
}

// la ressource demandée n'existe pas (ou n'est pas visible).
export class NonTrouve extends ErreurApp {
  constructor(message = 'Ressource introuvable', code = 'NON_TROUVE') {
    super(404, code, message)
  }
}

// conflit avec l'état actuel (email déjà pris, favori en double...).
export class Conflit extends ErreurApp {
  constructor(message = 'Conflit avec une ressource existante', code = 'CONFLIT') {
    super(409, code, message)
  }
}

// la requête est bien formée mais métier-invalide.
export class ValidationInvalide extends ErreurApp {
  constructor(message = 'Données invalides', code = 'VALIDATION_INVALIDE') {
    super(422, code, message)
  }
}

export const gestionnaireErreurs: ErrorHandler = (err, c) => {
  if (err instanceof ErreurApp) {
    return c.json({ code: err.code, message: err.message }, err.statut)
  }

  if (err instanceof HTTPException) {
    return c.json({ code: 'ERREUR_HTTP', message: err.message }, err.status)
  }

  // Erreur non anticipée : on la journalise en entier, mais on ne fuite
  // jamais le détail (message SQL, chemin de fichier) vers le client.
  console.error('[erreur non gérée]', err)
  return c.json({ code: 'ERREUR_INTERNE', message: 'Une erreur interne est survenue' }, 500)
}
