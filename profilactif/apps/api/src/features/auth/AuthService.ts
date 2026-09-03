// Logique applicative de l'authentification. Ne connaît ni Hono ni MySQL :
// il reçoit des données déjà validées et lève des `ErreurApp` ; c'est le
// handler qui traduit en HTTP.

import { randomUUID } from 'node:crypto'

import bcrypt from 'bcryptjs'

import { signToken } from '../../infrastructure/auth.middleware.js'
import { Conflit, NonAuthentifie, NonTrouve } from '../../shared/errors.js'
import { AuthRepository, type AppUserRow } from './AuthRepository.js'
import type { AuthResponse, LoginInput, PublicUser, SignupInput } from './AuthSchema.js'

// Hash bcrypt valide qui n'appartient à personne : sert à comparer un mot de
// passe même quand l'email est inconnu, pour que le temps de réponse ne
// révèle pas l'existence d'un compte.
const DUMMY_HASH = '$2b$10$L0jdsnnBNcoVa44tWidwFOYulYM39d6TDR1KDWb4MsNjKGW68Cj4i'

function bcryptCost(): number {
  const value = Number(process.env.BCRYPT_ROUNDS ?? 10)
  return Number.isInteger(value) && value >= 4 && value <= 15 ? value : 10
}

function isDuplicateMail(err: unknown): boolean {
  return (
    typeof err === 'object' && err !== null && (err as { code?: string }).code === 'ER_DUP_ENTRY'
  )
}

function toPublicUser(row: AppUserRow): PublicUser {
  return {
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    mail: row.mail,
    phone: row.phone,
    role: row.role,
    status: row.status,
    createdAt: row.createdAt,
  }
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = new AuthRepository()) {}

  async signup(input: SignupInput): Promise<AuthResponse> {
    if (await this.repo.findByMail(input.mail)) {
      throw new Conflit('Cette adresse email est déjà utilisée', 'MAIL_DEJA_UTILISE')
    }

    const passwordHash = await bcrypt.hash(input.password, bcryptCost())
    const id = randomUUID()

    try {
      await this.repo.create({
        id,
        firstName: input.firstName,
        lastName: input.lastName,
        mail: input.mail,
        phone: input.phone ?? null,
        passwordHash,
        role: input.role,
      })
    } catch (err) {
      // Deux inscriptions simultanées sur le même email : la contrainte UNIQUE
      // tranche, on renvoie le même conflit que la vérification ci-dessus.
      if (isDuplicateMail(err)) {
        throw new Conflit('Cette adresse email est déjà utilisée', 'MAIL_DEJA_UTILISE')
      }
      throw err
    }

    const created = await this.repo.findById(id)
    if (!created) throw new Error(`Utilisateur ${id} introuvable juste après sa création`)

    return { token: signToken({ id: created.id, role: created.role }), user: toPublicUser(created) }
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const row = await this.repo.findByMail(input.mail)

    // Comparaison systématique, même si l'email est inconnu (voir DUMMY_HASH).
    const matches = await bcrypt.compare(input.password, row?.passwordHash ?? DUMMY_HASH)

    if (!row || !matches) {
      // Message identique que l'email soit inconnu ou le mot de passe faux.
      throw new NonAuthentifie('Email ou mot de passe incorrect', 'IDENTIFIANTS_INVALIDES')
    }

    if (row.status !== 'active') {
      throw new NonAuthentifie('Ce compte est suspendu', 'COMPTE_SUSPENDU')
    }

    return { token: signToken({ id: row.id, role: row.role }), user: toPublicUser(row) }
  }

  // Jeton encore valide mais compte supprimé entre-temps.
  async me(id: string): Promise<PublicUser> {
    const row = await this.repo.findById(id)
    if (!row) throw new NonTrouve('Utilisateur introuvable', 'UTILISATEUR_INTROUVABLE')
    return toPublicUser(row)
  }
}
