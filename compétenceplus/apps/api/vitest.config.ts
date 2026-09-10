import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    /*
     * Le projet compile en NodeNext : les imports relatifs portent une
     * extension `.js` (ex. `./Questionnaire.js`) alors que le fichier est un
     * `.ts`. En test on retire cette extension pour laisser Vite résoudre le
     * `.ts` correspondant.
     */
    alias: [{ find: /^(\.{1,2}\/.*)\.js$/, replacement: '$1' }],
  },
})
