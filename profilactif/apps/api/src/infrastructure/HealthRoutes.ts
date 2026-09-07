import { readFileSync } from 'node:fs'

import { Hono } from 'hono'

import { pingDatabase } from './db.client.js'

// `APP_VERSION` d'abord : un déploiement peut l'injecter, le package.json ne
// connaît que la version du code source.
function lireVersion(): string {
  const surcharge = process.env.APP_VERSION?.trim()

  if (surcharge) {
    return surcharge
  }

  try {
    // Chemin valable depuis `src/` (tsx) comme depuis `dist/` (node) : les deux
    // sont au même niveau sous `apps/api/`.
    const brut = readFileSync(new URL('../../package.json', import.meta.url), 'utf8')
    const paquet = JSON.parse(brut) as { version?: string }

    return paquet.version ?? 'inconnue'
  } catch {
    return 'inconnue'
  }
}

// Lue une seule fois : la sonde ne doit pas toucher au disque à chaque appel.
const VERSION = lireVersion()

export const healthRoutes = new Hono()

// Mêmes clés en 200 et en 503, sans horodatage : la réponse doit être identique
// d'un appel à l'autre.
healthRoutes.get('/', async (c) => {
  const baseDisponible = await pingDatabase()

  if (!baseDisponible) {
    return c.json({ status: 'degraded', version: VERSION, database: 'down' }, 503)
  }

  return c.json({ status: 'ok', version: VERSION, database: 'up' }, 200)
})
