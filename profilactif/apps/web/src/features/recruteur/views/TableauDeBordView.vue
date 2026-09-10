<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BarreLateraleRecruteur from '@/features/recruteur/components/BarreLateraleRecruteur.vue';
import FavoriteService from '@/services/FavoriteService';
import ContactService from '@/services/ContactService';
import ProfileService from '@/services/ProfileService';
import { useAuthStore } from '@/shared/stores/auth';
import type { Favorite, Profile } from '@/shared/types/api';

const authStore = useAuthStore();

const route = useRoute();
const router = useRouter();

type Categorie = 'favoris' | 'consultes' | 'contactes';
const CATEGORIES: Categorie[] = ['favoris', 'consultes', 'contactes'];

/*
 * L'onglet vit dans la barre d'adresse, pas seulement dans le composant : c'est
 * ce qui permet à « Mes favoris » de la barre latérale de pointer dessus, et à
 * un lien d'être partagé ou rechargé sans perdre l'onglet ouvert.
 */
function categorieDepuisUrl(): Categorie {
  const valeur = route.query.onglet;

  return CATEGORIES.includes(valeur as Categorie) ? (valeur as Categorie) : 'favoris';
}

const profils = ref<Profile[]>([]);
const categorieActive = ref<Categorie>(categorieDepuisUrl());

/* Cliquer la même entrée depuis la barre latérale ne recharge pas la vue :
   sans ce watch, l'onglet ne suivrait pas la navigation. */
watch(
  () => route.query.onglet,
  () => {
    categorieActive.value = categorieDepuisUrl();
  },
);

/* `replace` et non `push` : changer d'onglet ne mérite pas une entrée
   d'historique, sinon le retour arrière ne quitte jamais la page. */
function choisirCategorie(categorie: Categorie): void {
  categorieActive.value = categorie;
  void router.replace({ query: { ...route.query, onglet: categorie } });
}

const chargement = ref(false);
const erreur = ref('');

const prenom = computed(() => authStore.user?.firstName ?? '');

const profilsCategorie = computed(() => {
  if (categorieActive.value === 'favoris')
    return profils.value.filter((profil) => favorisIds.value.has(profil.id));
  if (categorieActive.value === 'contactes')
    return profils.value.filter((profil) => contactsIds.value.has(profil.id));
  return profils.value.filter((profil) => profilsConsultes.value.has(profil.id));
});

/*
 * Ids of the active tab, whatever the tab. A candidate who left the catalogue
 * is absent from `profils`, so counting the raw ids and listing the resolved
 * ones gave two different numbers.
 */
const idsCategorie = computed(() => {
  if (categorieActive.value === 'favoris') return favorisIdsSource.value;
  if (categorieActive.value === 'contactes') return contactsIdsSource.value;
  return profilsConsultesSource.value;
});

const profilsConnus = computed(() => new Set(profils.value.map((profil) => profil.id)));

// No name, no sector: the row says a profile is gone, nothing about who.
const retiresCategorie = computed(() =>
  idsCategorie.value.filter((id) => !profilsConnus.value.has(id)),
);

function favoriDe(seekerId: string): Favorite | undefined {
  return favorisSource.value.find((favori) => favori.seekerId === seekerId);
}

async function retirerFavori(seekerId: string): Promise<void> {
  const favori = favoriDe(seekerId);
  if (!favori) return;

  try {
    await FavoriteService.deleteFavorite(favori.id);
    favorisSource.value = favorisSource.value.filter((item) => item.id !== favori.id);
    favorisIdsSource.value = favorisSource.value.map((item) => item.seekerId);
  } catch {
    erreur.value = 'Impossible de retirer ce favori.';
  }
}

const favorisIds = computed(() => new Set(favorisIdsSource.value));
const contactsIds = computed(() => new Set(contactsIdsSource.value));
const profilsConsultes = computed(() => new Set(profilsConsultesSource.value));
// Full rows, not just ids: removing a favourite needs its own identifier.
const favorisSource = ref<Favorite[]>([]);
const favorisIdsSource = ref<string[]>([]);
const contactsIdsSource = ref<string[]>([]);
const profilsConsultesSource = ref<string[]>([]);

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
    const [profiles, favoris, contacts] = await Promise.all([
      ProfileService.getProfiles(),
      FavoriteService.getFavoritesByRecruiter(recruiterId),
      ContactService.getContactsByRecruiter(recruiterId),
    ]);

    profils.value = profiles;
    favorisSource.value = favoris;
    favorisIdsSource.value = favoris.map((favori) => favori.seekerId);
    contactsIdsSource.value = [...new Set(contacts.map((contact) => contact.seekerId))];
    profilsConsultesSource.value = JSON.parse(
      localStorage.getItem('recruiter-viewed-' + recruiterId) || '[]',
    );
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
        <nav class="grid gap-3 sm:grid-cols-3" aria-label="Categories des profils">
          <button
            type="button"
            class="rounded-card border border-surface-line bg-surface-page p-4 text-left hover:bg-surface-subtle"
            :class="{ 'border-brand bg-brand-50': categorieActive === 'favoris' }"
            @click="choisirCategorie('favoris')"
          >
            <span class="block font-heading text-[12px] uppercase text-ink-muted"
              >Profils favoris</span
            >
            <strong class="mt-2 block text-[24px] text-brand">{{ favorisIdsSource.length }}</strong>
          </button>
          <button
            type="button"
            class="rounded-card border border-surface-line bg-surface-page p-4 text-left hover:bg-surface-subtle"
            :class="{ 'border-brand bg-brand-50': categorieActive === 'consultes' }"
            @click="choisirCategorie('consultes')"
          >
            <span class="block font-heading text-[12px] uppercase text-ink-muted"
              >Profils consultes</span
            >
            <strong class="mt-2 block text-[24px] text-brand">{{
              profilsConsultesSource.length
            }}</strong>
          </button>
          <button
            type="button"
            class="rounded-card border border-surface-line bg-surface-page p-4 text-left hover:bg-surface-subtle"
            :class="{ 'border-brand bg-brand-50': categorieActive === 'contactes' }"
            @click="choisirCategorie('contactes')"
          >
            <span class="block font-heading text-[12px] uppercase text-ink-muted"
              >Profils contactes</span
            >
            <strong class="mt-2 block text-[24px] text-brand">{{
              contactsIdsSource.length
            }}</strong>
          </button>
        </nav>

        <section
          class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-6"
        >
          <h2 class="text-[18px]">
            {{
              categorieActive === 'favoris'
                ? 'Profils favoris'
                : categorieActive === 'consultes'
                  ? 'Profils consultes'
                  : 'Profils contactes'
            }}
          </h2>
          <p
            v-if="!profilsCategorie.length && !retiresCategorie.length"
            class="text-[15px] text-ink-muted"
          >
            Aucun profil dans cette categorie.
          </p>
          <ul v-else class="flex flex-col gap-3">
            <li v-for="candidat in profilsCategorie" :key="candidat.id">
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
                  <span class="font-heading text-[15px] font-semibold text-ink"
                    >{{ candidat.firstName }} {{ candidat.lastName }}</span
                  >
                  <span class="text-[14px] text-ink-muted"
                    >{{ candidat.targetSector ?? 'Secteur non renseigne' }} -
                    {{ candidat.location ?? 'Lieu non renseigne' }}</span
                  >
                </span>
              </router-link>
            </li>

            <li v-for="id in retiresCategorie" :key="id">
              <div
                class="flex items-center gap-4 rounded-control border border-dashed border-surface-line p-4"
              >
                <span
                  class="flex size-11 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-[14px] font-bold text-ink-muted"
                  aria-hidden="true"
                >
                  —
                </span>
                <span class="flex min-w-0 flex-col gap-0.5">
                  <span class="font-heading text-[15px] font-semibold text-ink-muted">
                    Profil indisponible
                  </span>
                  <span class="text-[14px] text-ink-muted">
                    Ce profil n'est plus consultable.
                  </span>
                </span>
                <Button
                  v-if="categorieActive === 'favoris'"
                  label="Retirer"
                  severity="secondary"
                  outlined
                  class="ml-auto rounded-control font-heading text-[13px] font-semibold"
                  @click="retirerFavori(id)"
                />
              </div>
            </li>
          </ul>
        </section>
      </template>
    </main>
  </div>
</template>
