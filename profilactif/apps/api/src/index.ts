import 'dotenv/config'

import { serve } from '@hono/node-server'

import app from './app.js'
import { testDatabaseConnection } from './infrastructure/db.client.js'

const port = Number(process.env.PORT ?? 3000)

const serveur = serve({ fetch: app.fetch, port }, () => {
  console.log(`API démarrée sur http://localhost:${port}`)
})

// Vérifie la connexion MySQL au démarrage, sans empêcher le serveur de tourner.
void testDatabaseConnection().catch(() => {
  console.error('API démarrée sans base de données joignable')
})

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    serveur.close()
    process.exit(0)
  })
}
