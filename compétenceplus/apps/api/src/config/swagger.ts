import swaggerJSDoc from 'swagger-jsdoc'
import { swaggerUI } from '@hono/swagger-ui'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const rootDir = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Compétences+ API',
      version: '1.0.0',
      description: 'Documentation de l\'API Compétences+.',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        Bearer: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: [
    path.join(rootDir, 'features/**/*Routes.ts'),
    path.join(rootDir, 'infrastructure/**/*Routes.ts'),
    path.join(rootDir, 'app.ts'),
  ],
}

export const swaggerSpec = swaggerJSDoc(options)

export const swaggerUi = swaggerUI({
  url: '/api-docs/openapi.json',
  title: 'Compétences+ API Docs',
})
