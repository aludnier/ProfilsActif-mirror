<script setup lang="ts">
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Drawer from 'primevue/drawer';
import Toolbar from 'primevue/toolbar';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

import { useAuthStore } from '@/shared/stores/auth';
import { LIBELLES_ROLE } from '@/shared/types/roles';
import type { Role } from '@/shared/types/api';

type LienNav = {
  libelle: string;
  to?: RouteLocationNamedRaw;
};

/* Labels without a `to` have no view yet: inert text rather than a dead link. */
const liensNav: LienNav[] = [
  /* Points at the catalog: the public feed (FeedView.vue) is still an empty stub. */
  { libelle: 'Découvrir les profils', to: { name: 'recruiter-catalog' } },
  { libelle: 'Comment ça marche' },
  { libelle: 'Institutionnel' },
  { libelle: 'Aide' },
];

const route = useRoute();

function estActif(lien: LienNav): boolean {
  return lien.to !== undefined && route.name === lien.to.name;
}

const authStore = useAuthStore();

/* Neither the recruiter dashboard nor an admin home has a route yet, so both
   land on the screen they actually work from. */
const ROUTE_ESPACE: Record<Role, string> = {
  seeker: 'candidate-dashboard',
  recruiter: 'recruiter-dashboard',
  admin: 'admin-questions',
};

/*
 * Everything the header shows about the logged-in user, or `null` when nobody
 * is logged in. That `null` is the condition the template switches on.
 */
const compteConnecte = computed(() => {
  const compte = authStore.user;
  if (compte === null) {
    return null;
  }

  return {
    initiales: `${compte.firstName.charAt(0)}${compte.lastName.charAt(0)}`.toUpperCase(),
    libelleEspace: `Espace ${LIBELLES_ROLE[compte.role]}`,
    routeEspace: { name: ROUTE_ESPACE[compte.role] },
  };
});

/* Header content needs ~1130px; below `xl` the nav and actions move to the drawer. */
const menuOuvert = ref(false);

/* Any navigation closes the menu, browser back/forward included. */
watch(
  () => route.fullPath,
  () => {
    menuOuvert.value = false;
  },
);

/* Same threshold as the `xl:` classes (Tailwind's xl = 80rem): widening the
   window brings the header back, and the drawer would stay stuck open. */
const widthOffice = window.matchMedia('(min-width: 80rem)');

function fermerSiBureau(evenement: MediaQueryListEvent): void {
  if (evenement.matches) {
    menuOuvert.value = false;
  }
}

widthOffice.addEventListener('change', fermerSiBureau);

onBeforeUnmount(() => {
  widthOffice.removeEventListener('change', fermerSiBureau);
});
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
        <!-- Below `xl` the drawer serves these same links. -->
        <nav aria-label="Navigation principale" class="hidden xl:block">
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
        <!-- Logged in: avatar + space. Logged out: login + signup. -->
        <div class="hidden items-center gap-3 xl:flex">
          <template v-if="compteConnecte">
            <router-link
              :to="compteConnecte.routeEspace"
              class="-mx-2 flex items-center gap-2 rounded-control px-2 py-1 font-heading text-[14px] font-medium text-brand hover:bg-surface-subtle"
            >
              <Avatar
                :label="compteConnecte.initiales"
                shape="circle"
                class="bg-brand font-heading text-[13px] font-bold text-on-brand"
              />
              {{ compteConnecte.libelleEspace }}
            </router-link>

            <router-link
              :to="{ name: 'logout' }"
              class="font-heading text-[14px] font-medium text-ink hover:text-brand"
            >
              Déconnexion
            </router-link>
          </template>

          <template v-else>
            <router-link
              :to="{ name: 'login' }"
              class="font-heading text-[14px] font-medium text-ink hover:text-brand"
            >
              Se connecter
            </router-link>

            <!-- Primary action: the only header entry using the action color. -->
            <Button
              as="router-link"
              :to="{ name: 'signup' }"
              label="Créer un compte"
              class="rounded-control px-4 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
            />
          </template>
        </div>

        <!-- Text button: brand blue and the action colour are both barred from a
             button background here. Inline icon, primeicons isn't installed. -->
        <Button
          variant="text"
          severity="secondary"
          class="px-3 py-3 text-brand xl:hidden"
          aria-label="Ouvrir le menu de navigation"
          aria-controls="menu-principal"
          :aria-expanded="menuOuvert"
          @click="menuOuvert = true"
        >
          <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </Button>
      </template>
    </Toolbar>

    <Drawer
      id="menu-principal"
      v-model:visible="menuOuvert"
      position="left"
      header="Menu"
      block-scroll
      class="w-[min(20rem,85vw)]"
    >
      <nav aria-label="Menu principal">
        <ul class="flex flex-col font-heading text-[16px]">
          <li v-for="lien in liensNav" :key="lien.libelle" class="border-b border-surface-line">
            <router-link
              v-if="lien.to"
              :to="lien.to"
              :class="estActif(lien) ? 'font-medium text-brand' : 'text-ink hover:text-brand'"
              :aria-current="estActif(lien) ? 'page' : undefined"
              class="block py-3"
            >
              {{ lien.libelle }}
            </router-link>
            <span v-else class="block py-3 text-ink-muted">{{ lien.libelle }}</span>
          </li>
        </ul>
      </nav>

      <!-- Same switch as the toolbar: logged in vs logged out. -->
      <div class="mt-6 flex flex-col gap-3">
        <template v-if="compteConnecte">
          <router-link
            :to="compteConnecte.routeEspace"
            class="flex items-center gap-3 rounded-control border border-surface-line px-4 py-3 font-heading text-[14px] font-medium text-brand"
          >
            <Avatar
              :label="compteConnecte.initiales"
              shape="circle"
              class="bg-brand font-heading text-[13px] font-bold text-on-brand"
            />
            {{ compteConnecte.libelleEspace }}
          </router-link>

          <router-link
            :to="{ name: 'logout' }"
            class="rounded-control border border-surface-line px-4 py-3 text-center font-heading text-[14px] font-medium text-ink"
          >
            Déconnexion
          </router-link>
        </template>

        <template v-else>
          <router-link
            :to="{ name: 'login' }"
            class="rounded-control border border-surface-line px-4 py-3 text-center font-heading text-[14px] font-medium text-ink hover:text-brand"
          >
            Se connecter
          </router-link>

          <Button
            as="router-link"
            :to="{ name: 'signup' }"
            label="Créer un compte"
            class="justify-center rounded-control px-4 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
          />
        </template>
      </div>
    </Drawer>
  </header>
</template>
