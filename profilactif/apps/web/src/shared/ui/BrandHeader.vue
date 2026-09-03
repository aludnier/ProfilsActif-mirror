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
 * The last three labels come from the mockup but don't have a view yet:
 * they're rendered as inert text until the route exists, rather than as a
 * dead link.
 */
const liensNav: LienNav[] = [
  /*
   * Points at the catalog rather than `profiles`: the public feed
   * (features/profil/views/FeedView.vue) is still just an empty stub, while
   * the catalog actually displays profiles. Switch back to `profiles` once
   * the feed exists — the two views are distinct in docs/README.md, the feed
   * being public and the catalog reserved for recruiters.
   */
  { libelle: 'Découvrir les profils', to: { name: 'recruiter-catalog' } },
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
        <router-link
          :to="{ name: 'home' }"
          :aria-current="route.name === 'home' ? 'page' : undefined"
          aria-label="ProfilsActifs, retour à l'accueil"
          class="-mx-2 flex items-center gap-4 rounded-control px-2 py-1 hover:bg-surface-subtle"
        >
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
        </router-link>
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
        <div class="flex items-center gap-3">
          <router-link
            :to="{ name: 'login' }"
            class="font-heading text-[14px] font-medium text-ink hover:text-brand"
          >
            Se connecter
          </router-link>
          <Button
            as="router-link"
            :to="{ name: 'login' }"
            label="Espace Recruteur"
            class="rounded-control border-0 bg-brand-50 px-4 py-3 font-heading text-[14px] font-medium tracking-[0.75px] text-brand hover:bg-brand-100"
          />

          <!-- Primary action: the only header entry using the action color. -->
          <Button
            as="router-link"
            :to="{ name: 'signup' }"
            label="Créer un compte"
            class="rounded-control px-4 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
          />
        </div>
      </template>
    </Toolbar>
  </header>
</template>
