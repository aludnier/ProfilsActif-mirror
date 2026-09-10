import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      /* Donnée de référence partagée avec l'API (qui la lit sur disque) : elle vit
         dans migrations/, à côté de schema.sql, pas dans les sources du front. */
      '@data': fileURLToPath(new URL('../../migrations', import.meta.url)),
    },
  },
});
