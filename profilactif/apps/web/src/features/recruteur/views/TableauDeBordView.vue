<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import { computed, ref, watch } from 'vue';

import BarreLateraleRecruteur from '@/features/recruteur/components/BarreLateraleRecruteur.vue';
import FavoriteService from '@/services/FavoriteService';
import ContactService from '@/services/ContactService';
import ProfileService from '@/services/ProfileService';
import { useAuthStore } from '@/shared/stores/auth';
import { formaterNombre } from '@/shared/formatage';
import type { Profile } from '@/shared/types/api';

/* How many favourites the dashboard previews; the full list is its own page. */
const APERCU_FAVORIS = 4;

const authStore = useAuthStore();

const nombreProfils = ref(0);
const nombreFavoris = ref(0);
const nombreContacts = ref(0);
const derniersFavoris = ref<Profile[]>([]);

const chargement = ref(false);
const erreur = ref('');

const prenom = computed(() => authStore.user?.firstName ?? '');

const compteurs = computed(() => [
  { libelle: 'Profils disponibles', valeur: nombreProfils.value },
  { libelle: 'Mes favoris', valeur: nombreFavoris.value },
  { libelle: 'Mes contacts', valeur: nombreContacts.value },
]);

watch(
  () => authStore.user?.id,
  (id) => {
    if (id !== undefined) {
      charger(id);
    }
  },
  { immediate: true },
);

async function charger(recruiterId: string): Promise<void> {
  chargement.value = true;
  erreur.value = '';

  try {
    const [profils, favoris, contacts] = await Promise.all([
      ProfileService.getProfiles(),
      FavoriteService.getFavoritesByRecruiter(recruiterId),
      ContactService.getContactsByRecruiter(recruiterId),
    ]);

    nombreProfils.value = profils.length;
    nombreFavoris.value = favoris.length;
    nombreContacts.value = contacts.length;

    /*
     * A favourite only carries the candidate's id, so each preview costs one
     * request. Acceptable because we fetch four at most — a route joining the
     * two would be better the day the full list exists.
     */
    const recents = [...favoris]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, APERCU_FAVORIS);

    const fiches = await Promise.allSettled(
      recents.map((favori) => ProfileService.getProfile(favori.seekerId)),
    );

    /* A favourite pointing at a deleted account is skipped, not fatal. */
    derniersFavoris.value = fiches
      .filter((fiche) => fiche.status === 'fulfilled')
      .map((fiche) => (fiche as PromiseFulfilledResult<Profile>).value);
  } catch (err: any) {
    erreur.value = err.message || 'Erreur lors du chargement du tableau de bord.';
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-stretch">
    <BarreLateraleRecruteur class="hidden lg:flex" />

    <main class="flex min-w-0 flex-1 flex-col gap-8 bg-surface-subtle p-6 lg:p-10">
      <header class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-[28px]">Tableau de bord</h1>
          <p class="text-[15px] text-ink-muted">
            Bonjour {{ prenom }}, retrouvez ici votre activité de recrutement.
          </p>
        </div>

        <Button
          as="router-link"
          :to="{ name: 'recruiter-catalog' }"
          label="Parcourir le catalogue"
          class="rounded-control px-6 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
        />
      </header>

      <Message v-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>

      <p v-if="chargement" class="text-[15px] text-ink-muted">Chargement…</p>

      <template v-else>
        <div class="grid gap-6 sm:grid-cols-3">
          <section
            v-for="compteur in compteurs"
            :key="compteur.libelle"
            class="flex flex-col gap-2 rounded-card border border-surface-line bg-surface-page p-6"
          >
            <p class="font-heading text-[12px] uppercase tracking-[0.5px] text-ink-muted">
              {{ compteur.libelle }}
            </p>
            <p class="font-heading text-[32px] font-bold leading-none text-brand">
              {{ formaterNombre(compteur.valeur) }}
            </p>
          </section>
        </div>

        <section
          class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-6"
        >
          <h2 class="text-[18px]">Mes derniers favoris</h2>

          <p v-if="derniersFavoris.length === 0" class="text-[15px] text-ink-muted">
            Aucun favori pour l'instant. Parcourez le catalogue et mettez de côté les profils qui
            vous intéressent.
          </p>

          <ul v-else class="flex flex-col gap-3">
            <li v-for="candidat in derniersFavoris" :key="candidat.id">
              <router-link
                :to="{ name: 'recruiter-candidate-profile', params: { id: candidat.id } }"
                class="flex items-center gap-4 rounded-control border border-surface-line p-4 hover:bg-surface-subtle"
              >
                <span
                  class="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-[14px] font-bold text-brand"
                  aria-hidden="true"
                >
                  {{ candidat.firstName.charAt(0) }}{{ candidat.lastName.charAt(0) }}
                </span>

                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-heading text-[15px] font-semibold text-ink">
                    {{ candidat.firstName }} {{ candidat.lastName }}
                  </span>
                  <span class="text-[14px] text-ink-muted">
                    {{ candidat.targetSector ?? 'Secteur non renseigné' }} ·
                    {{ candidat.location ?? 'Lieu non renseigné' }}
                  </span>
                </span>
              </router-link>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>
