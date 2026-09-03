import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';
import PrimeVue from 'primevue/config';
import type { App } from 'vue';

/*
    PrimeVue Settings
*/

const ProfilsActifsPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: 'var(--color-action-50)',
      100: 'var(--color-action-100)',
      200: 'var(--color-action-200)',
      300: 'var(--color-action-300)',
      400: 'var(--color-action-400)',
      500: 'var(--color-action-500)',
      600: 'var(--color-action-600)',
      700: 'var(--color-action-700)',
      800: 'var(--color-action-800)',
      900: 'var(--color-action-900)',
      950: 'var(--color-action-950)',
    },
    colorScheme: {
      light: {
        primary: {
          color: 'var(--color-action-500)',
          contrastColor: 'var(--color-on-action)',
          hoverColor: 'var(--color-action-600)',
          activeColor: 'var(--color-action-700)',
        },
      },
    },
  },
});

export function installPrimeVue(app: App): void {
  app.use(PrimeVue, {
    theme: {
      preset: ProfilsActifsPreset,
      options: {
        darkModeSelector: 'none',
        cssLayer: { name: 'primevue', order: 'theme, base, primevue' },
      },
    },
  });
}
