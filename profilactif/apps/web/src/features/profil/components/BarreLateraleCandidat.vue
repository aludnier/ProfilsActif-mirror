<script setup lang="ts">
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

type EntreeEspace = {
  libelle: string;
  to?: RouteLocationNamedRaw;
  requis?: boolean;
};

const entrees: EntreeEspace[] = [
  { libelle: 'Tableau de bord', to: { name: 'candidate-dashboard' } },
  { libelle: 'Mon profil public', to: { name: 'candidate-public-profile' } },
  { libelle: 'Certification JEB', requis: true, to: { name: 'candidate-certification'} },
  { libelle: 'Compétences & CV' },
  { libelle: "Paramètres d'accès" },
];

const route = useRoute();

function estActive(entree: EntreeEspace): boolean {
  return entree.to !== undefined && route.name === entree.to.name;
}
</script>

<template>
  <aside
    class="flex w-[280px] shrink-0 flex-col items-start gap-2 border-r border-surface-line bg-surface-page p-6"
  >
    <h2 class="pb-2 font-heading text-[11px] font-bold uppercase text-ink-muted">
      Espace candidat
    </h2>

    <nav aria-label="Espace candidat" class="w-full">
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
            <span
              v-if="entree.requis"
              class="rounded-full bg-action px-1.5 py-0.5 text-[10px] font-bold uppercase text-on-action"
            >
              Requis
            </span>
          </component>
        </li>
      </ul>
    </nav>

    <span class="my-2 h-px w-full bg-surface-line" aria-hidden="true" />

    <div class="flex w-full flex-col items-start gap-3 rounded-control bg-surface-muted p-4">
      <h3 class="font-heading text-[12px] uppercase text-brand">Charte éthique</h3>
      <p class="text-[12px] leading-[1.5] text-brand">
        La vidéo ne doit pas excéder 2 minutes. Habillez-vous de manière professionnelle,
        assurez-vous de l'éclairage et soignez la clarté de votre élocution.
      </p>
    </div>
  </aside>
</template>
