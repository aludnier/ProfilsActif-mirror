// Logique applicative de l'authentification. Ne connaît ni Hono ni MySQL :
// il reçoit des données déjà validées et lève des `ErreurApp`, c'est
// `AuthRoutes` qui traduit en HTTP.

import bcrypt from 'bcryptjs'
import { Conflit, NonAuthentifie, NonTrouve } from '../../shared/errors.js'
import { signerToken } from '../../infrastructure/auth.middleware.js'
import * as depot from './AuthRepository.js'
import type { LigneUtilisateurPublic } from './AuthRepository.js'
import type { Connexion, Inscription, ReponseAuth, UtilisateurPublic } from './AuthSchema.js'


 // Hash valide d'un mot de passe qui n'appartient à personne. Sert à faire
 // travailler bcrypt même quand l'email est inconnu : sans ça, le temps de

const HASH_FACTICE = '$2b$10$L0jdsnnBNcoVa44tWidwFOYulYM39d6TDR1KDWb4MsNjKGW68Cj4i'

function coutBcrypt(): number {
  const valeur = Number(process.env.BCRYPT_ROUNDS ?? 10)
  return Number.isInteger(valeur) && valeur >= 4 && valeur <= 15 ? valeur : 10
}

function versPublic(ligne: LigneUtilisateurPublic): UtilisateurPublic {
  return {
    id: ligne.id,
    prenom: ligne.prenom,
    nom: ligne.nom,
    email: ligne.email,
    role: ligne.role,
    creeLe: ligne.cree_le,
  }
}

function estEmailEnDouble(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY'
}

export async function inscrire(entree: Inscription): Promise<ReponseAuth> {
  if (await depot.trouverParEmail(entree.email)) {
    throw new Conflit('Cette adresse email est déjà utilisée', 'EMAIL_DEJA_UTILISE')
  }

  const motDePasseHash = await bcrypt.hash(entree.motDePasse, coutBcrypt())

  let id: number
  try {
    id = await depot.creer({
      prenom: entree.prenom,
      nom: entree.nom,
      email: entree.email,
      motDePasseHash,
      role: entree.role,
    })
  } catch (err) {
    // Deux inscriptions simultanées sur le même email : la contrainte UNIQUE
    // tranche, on renvoie le même conflit que la vérification ci-dessus.
    if (estEmailEnDouble(err)) {
      throw new Conflit('Cette adresse email est déjà utilisée', 'EMAIL_DEJA_UTILISE')
    }
    throw err
  }

  const cree = await depot.trouverParId(id)
  if (!cree) throw new Error(`Utilisateur ${id} introuvable juste après sa création`)

  return {
    token: signerToken({ id: cree.id, role: cree.role }),
    utilisateur: versPublic(cree),
  }
}

export async function connecter(entree: Connexion): Promise<ReponseAuth> {
  const ligne = await depot.trouverParEmail(entree.email)

  // Comparaison systématique, même si l'email est inconnu (voir HASH_FACTICE).
  const correspond = await bcrypt.compare(
    entree.motDePasse,
    ligne?.mot_de_passe_hash ?? HASH_FACTICE,
  )

  if (!ligne || !correspond) {
    // Message identique que l'email soit inconnu ou le mot de passe faux :
    // on ne confirme pas l'existence d'un compte.
    throw new NonAuthentifie('Email ou mot de passe incorrect', 'IDENTIFIANTS_INVALIDES')
  }

  return {
    token: signerToken({ id: ligne.id, role: ligne.role }),
    utilisateur: versPublic(ligne),
  }
}

// Jeton encore valide mais compte supprimé entre-temps : on ne peut pas renvoyer un utilisateur inexistant.
export async function utilisateurCourant(id: number): Promise<UtilisateurPublic> {
  const ligne = await depot.trouverParId(id)
  if (!ligne) throw new NonTrouve('Utilisateur introuvable', 'UTILISATEUR_INTROUVABLE')
  return versPublic(ligne)
}
