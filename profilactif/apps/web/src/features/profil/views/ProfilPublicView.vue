<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { computed, ref, watch } from 'vue';

import BarreLateraleCandidat from '@/features/profil/components/BarreLateraleCandidat.vue';
import ProfileService from '@/services/ProfileService';
import VideoService from '@/services/VideoService';
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue';
import { useAuthStore } from '@/shared/stores/auth';
import type { Profile } from '@/shared/types/api';
import { extraireIdYouTube } from '@/shared/youtube';

/*
 * The candidate's own public sheet: what a recruiter sees, read-only. No id in
 * the route — it always reads the logged-in user, so a candidate cannot reach
 * anyone else's sheet from here.
 */
const authStore = useAuthStore();

const profil = ref<Profile | null>(null);
const idVideo = ref<string | null>(null);
const chargement = ref(false);
const erreur = ref('');

const initiales = computed(() => {
  const source = profil.value;
  if (source === null) {
    return '';
  }

  return `${source.firstName.charAt(0)}${source.lastName.charAt(0)}`.toUpperCase();
});

/* Everything the sheet shows besides the identity banner. Empty fields are
   hidden rather than shown as "non renseigné": this is a shop window. */
const details = computed(() => {
  const source = profil.value;
  if (source === null) {
    return [];
  }

  return [
    { libelle: 'Localisation', valeur: source.location },
    { libelle: 'Secteur ciblé', valeur: source.targetSector },
    { libelle: 'Email', valeur: source.mail },
    { libelle: 'Téléphone', valeur: source.phone },
  ].filter((detail) => detail.valeur !== null && detail.valeur !== '');
});

watch(
  () => authStore.user?.id,
  (id) => {
    if (id !== undefined) {
      charger(id);
    }
  },
  { immediate: true },
);

async function charger(id: string): Promise<void> {
  chargement.value = true;
  erreur.value = '';

  try {
    profil.value = await ProfileService.getProfile(id);

    const videos = await VideoService.getVideosBySeeker(id);
    idVideo.value = videos[0] === undefined ? null : extraireIdYouTube(videos[0].url);
  } catch (err: any) {
    erreur.value = err.message || 'Impossible de charger votre profil.';
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-stretch">
    <BarreLateraleCandidat class="hidden lg:flex" />

    <main class="flex min-w-0 flex-1 flex-col gap-6 bg-surface-subtle p-6 lg:p-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-[28px]">Mon profil public</h1>
          <p class="text-[15px] text-ink-muted">
            Voici votre fiche telle que la voient les recruteurs.
          </p>
        </div>
        <Button
          label="Modifier mon profil"
          severity="secondary"
          outlined
          class="rounded-control font-heading text-[14px] font-semibold"
          @click="$router.push({ name: 'candidate-dashboard' })"
        />
      </div>

      <Message v-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>

      <p v-if="chargement" class="text-[15px] text-ink-muted">Chargement…</p>

      <template v-else-if="profil !== null">
        <section
          class="flex flex-wrap items-center gap-5 rounded-card border border-surface-line bg-surface-page p-6"
        >
          <span
            class="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-[20px] font-bold text-brand"
            aria-hidden="true"
          >
            {{ initiales }}
          </span>

          <div class="flex min-w-0 flex-col gap-1">
            <h2 class="text-[22px]">{{ profil.firstName }} {{ profil.lastName }}</h2>
            <p v-if="profil.targetSector" class="text-[15px] text-ink-muted">
              {{ profil.targetSector }}
            </p>
          </div>

          <Tag
            v-if="idVideo !== null"
            value="Vidéo en ligne"
            class="ml-auto rounded-badge bg-surface-muted px-3 py-1.5 font-heading text-[12px] font-medium text-brand"
          />
        </section>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
          <div class="flex flex-col gap-6">
            <section
              v-if="profil.bio"
              class="flex flex-col gap-3 rounded-card border border-surface-line bg-surface-page p-6"
            >
              <h2 class="text-[18px]">À propos de mon parcours</h2>
              <p class="whitespace-pre-line text-[15px] leading-[1.7]">{{ profil.bio }}</p>
            </section>

            <section
              class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-6"
            >
              <h2 class="text-[18px]">Informations</h2>
              <dl class="grid gap-3 sm:grid-cols-2">
                <div v-for="detail in details" :key="detail.libelle" class="flex flex-col gap-0.5">
                  <dt class="font-heading text-[12px] uppercase tracking-[0.5px] text-ink-muted">
                    {{ detail.libelle }}
                  </dt>
                  <dd class="text-[15px]">{{ detail.valeur }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section
            class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-5"
          >
            <h2 class="text-[18px]">Ma vidéo de présentation</h2>

            <LecteurYouTube
              v-if="idVideo !== null"
              :id-you-tube="idVideo"
              titre="Ma vidéo de présentation"
            />
            <p v-else class="text-[14px] text-ink-muted">
              Aucune vidéo publiée. C'est le premier élément que regarde un recruteur.
            </p>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>
