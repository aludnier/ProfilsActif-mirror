<script setup lang="ts">
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

type LienNav = {
  libelle: string;
  to?: RouteLocationNamedRaw;
};

/*
 * Les trois derniers libellés viennent de la maquette mais n'ont pas encore de
 * vue : ils sont rendus en texte inerte tant que la route n'existe pas, plutôt
 * qu'en lien mort.
 */
const liensNav: LienNav[] = [
  { libelle: 'Découvrir les profils', to: { name: 'profiles' } },
  { libelle: 'Comment ça marche' },
  { libelle: 'Institutionnel' },
  { libelle: 'Aide' },
];

const route = useRoute();

function estActif(lien: LienNav): boolean {
  return lien.to !== undefined && route.name === lien.to.name;
}
</script>

<template>
  <header>
    <!--
      Le padding interne du Toolbar tient lieu de zone de protection du
      bloc-marque (règle de marque, cf. CLAUDE.md) : la marge minimale autour du
      logo est portée par le token du composant, pas par une marge codée à la main.
      `role` est neutralisé car la sémantique de repère vient du <header> et du <nav>.
    -->
    <Toolbar
      class="h-header rounded-none border-0 border-b border-surface-line"
      :dt="{
        background: 'var(--color-surface-page)',
        borderColor: 'var(--color-surface-line)',
        borderRadius: '0',
        padding: '0 var(--spacing-gutter)',
      }"
      :pt="{ root: { role: undefined } }"
    >
      <template #start>
        <div class="flex items-center gap-4">
          <!--
            La maquette fixe ce bloc à 44px de large alors que le libellé y
            déborde (Figma : texte de 51px posé à x=-3.5). On laisse donc le
            bloc s'ajuster à son texte, sinon le blanc dépasse sur le fond blanc.
          -->
          <div
            class="flex h-[54px] min-w-[44px] flex-col items-center gap-0.5 bg-brand px-1 py-1.5 font-heading text-[8px] font-bold uppercase leading-none text-on-brand"
          >
            <span class="h-1 w-8 bg-on-brand" aria-hidden="true" />
            <span class="mb-0.5 h-5 w-8 bg-on-brand" aria-hidden="true" />
            <span>République</span>
            <span>Française</span>
          </div>

          <span class="h-10 w-px bg-surface-line" aria-hidden="true" />

          <div class="flex flex-col gap-0.5 font-heading">
            <span class="text-[18px] font-bold tracking-[-0.5px] text-brand">ProfilsActifs</span>
            <span class="text-[10px] font-medium uppercase tracking-[0.5px] text-ink-muted">
              Service public numérique
            </span>
          </div>
        </div>
      </template>

      <template #center>
        <nav aria-label="Navigation principale">
          <ul class="flex items-center gap-8 font-heading text-[14px]">
            <li v-for="lien in liensNav" :key="lien.libelle">
              <router-link
                v-if="lien.to"
                :to="lien.to"
                :class="estActif(lien) ? 'font-medium text-brand' : 'text-ink hover:text-brand'"
                :aria-current="estActif(lien) ? 'page' : undefined"
              >
                {{ lien.libelle }}
              </router-link>
              <span v-else class="text-ink-muted">{{ lien.libelle }}</span>
            </li>
          </ul>
        </nav>
      </template>

      <template #end>
        <!--
          Pastille à fond clair + texte bleu : le bleu institutionnel est
          interdit en fond de bouton, et la couleur d'action reste réservée aux
          actions primaires (créer un profil), pas à une entrée de navigation.
        -->
        <Button
          as="router-link"
          :to="{ name: 'recruiter-catalog' }"
          label="Espace Recruteur"
          class="rounded-control border-0 bg-brand-50 px-4 py-3 font-heading text-[14px] font-medium tracking-[0.75px] text-brand hover:bg-brand-100"
        />
      </template>
    </Toolbar>
  </header>
</template>
