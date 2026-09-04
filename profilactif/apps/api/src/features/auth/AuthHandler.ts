import type { Context } from 'hono'

import type { AuthVariables } from '../../infrastructure/auth.middleware.js'
import { ValidationInvalide } from '../../shared/errors.js'
import { loginSchema, signupSchema } from './AuthSchema.js'
import { AuthService } from './AuthService.js'

const authService = new AuthService()

// Corps JSON illisible → 400 plutôt qu'une 500 non gérée.
async function readJson(c: Context): Promise<unknown> {
  try {
    return await c.req.json()
  } catch {
    throw new ValidationInvalide('Corps de requête JSON invalide', 'JSON_INVALIDE')
  }
}

export async function signupHandler(c: Context) {
  const result = signupSchema.safeParse(await readJson(c))
  if (!result.success) {
    throw new ValidationInvalide("Données d'inscription invalides", 'INSCRIPTION_DONNEES_INVALIDES')
  }

  return c.json(await authService.signup(result.data), 201)
}

export async function loginHandler(c: Context) {
  const result = loginSchema.safeParse(await readJson(c))
  if (!result.success) {
    throw new ValidationInvalide('Données de connexion invalides', 'CONNEXION_DONNEES_INVALIDES')
  }

  return c.json(await authService.login(result.data))
}

export async function meHandler(c: Context<{ Variables: AuthVariables }>) {
  const { id } = c.get('user')

  return c.json(await authService.me(id))
}
