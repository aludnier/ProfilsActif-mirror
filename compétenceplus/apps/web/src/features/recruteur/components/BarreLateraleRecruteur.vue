<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

// Every entry opens a real view: no inert label in the menu.
type EntreeEspace = {
  libelle: string;
  to: RouteLocationNamedRaw;
};

const entrees: EntreeEspace[] = [
  { libelle: 'Tableau de bord', to: { name: 'recruiter-dashboard' } },
  { libelle: 'Catalogue des profils', to: { name: 'recruiter-catalog' } },
  // The dashboard already holds those lists: the tab is picked from the URL.
  { libelle: 'Mes favoris', to: { name: 'recruiter-dashboard', query: { onglet: 'favoris' } } },
  {
    libelle: 'Mes contacts',
    to: { name: 'recruiter-dashboard', query: { onglet: 'contactes' } },
  },
];

const route = useRoute();

function estActive(entree: EntreeEspace): boolean {
  if (route.name !== entree.to.name) {
    return false;
  }

  // Three entries target the dashboard: only the tab tells them apart.
  const onglet = entree.to.query?.onglet;

  return onglet === undefined ? route.query.onglet === undefined : route.query.onglet === onglet;
}
</script>

<template>
  <aside
    class="flex w-[280px] shrink-0 flex-col items-start gap-2 border-r border-surface-line bg-surface-page p-6"
  >
    <h2 class="pb-2 font-heading text-[11px] font-bold uppercase text-ink-muted">
      Espace recruteur
    </h2>

    <nav aria-label="Espace recruteur" class="w-full">
      <ul class="flex flex-col gap-2">
        <li v-for="entree in entrees" :key="entree.libelle">
          <router-link
            :to="entree.to"
            :aria-current="estActive(entree) ? 'page' : undefined"
            class="flex w-full items-center justify-between gap-2 rounded-control p-3 font-heading text-[14px]"
            :class="
              estActive(entree)
                ? 'bg-surface-muted font-bold text-brand'
                : 'font-medium text-ink hover:bg-surface-subtle'
            "
          >
            {{ entree.libelle }}
          </router-link>
        </li>
      </ul>
    </nav>

    <span class="my-2 h-px w-full bg-surface-line" aria-hidden="true" />

    <!-- Same wording as the catalogue's filter panel: one charter, one text. -->
    <div class="flex w-full flex-col items-start gap-3 rounded-control bg-surface-muted p-4">
      <h3 class="font-heading text-[12px] uppercase text-brand">Charte de déontologie</h3>
      <p class="text-[12px] leading-[1.5] text-brand">
        La consultation des profils implique l'acceptation de notre charte anti-discrimination et de
        déontologie du service.
      </p>
    </div>
  </aside>
</template>
