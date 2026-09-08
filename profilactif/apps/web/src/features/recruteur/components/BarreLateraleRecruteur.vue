<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

type EntreeEspace = {
  libelle: string;
  to?: RouteLocationNamedRaw;
};

/* Entries without a `to` have no view yet: inert text rather than a dead link. */
const entrees: EntreeEspace[] = [
  { libelle: 'Tableau de bord', to: { name: 'recruiter-dashboard' } },
  { libelle: 'Catalogue des profils', to: { name: 'recruiter-catalog' } },
  /* Le tableau de bord porte déjà la liste : l'onglet se choisit par l'URL. */
  { libelle: 'Mes favoris', to: { name: 'recruiter-dashboard', query: { onglet: 'favoris' } } },
  {
    libelle: 'Mes contacts',
    to: { name: 'recruiter-dashboard', query: { onglet: 'contactes' } },
  },
  { libelle: "Paramètres d'accès" },
];

const route = useRoute();

function estActive(entree: EntreeEspace): boolean {
  if (entree.to === undefined || route.name !== entree.to.name) {
    return false;
  }

  /* Deux entrées visent le tableau de bord : seul l'onglet les distingue. */
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
          <component
            :is="entree.to ? 'router-link' : 'span'"
            :to="entree.to"
            :aria-current="estActive(entree) ? 'page' : undefined"
            class="flex w-full items-center justify-between gap-2 rounded-control p-3 font-heading text-[14px]"
            :class="
              estActive(entree)
                ? 'bg-surface-muted font-bold text-brand'
                : entree.to
                  ? 'font-medium text-ink hover:bg-surface-subtle'
                  : 'font-medium text-ink-muted'
            "
          >
            {{ entree.libelle }}
          </component>
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
