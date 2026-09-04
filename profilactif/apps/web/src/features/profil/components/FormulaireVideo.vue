<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import { computed, ref, watch } from 'vue';

import VideoService from '@/services/VideoService';
import { useAuthStore } from '@/shared/stores/auth';
import type { Video } from '@/shared/types/api';
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue';
import { extraireIdYouTube, urlPubliqueYouTube } from '@/shared/youtube';

const emit = defineEmits<{ (e: 'video-presente', presente: boolean): void }>();

const authStore = useAuthStore();

/* The mockup shows a single presentation video, so of the seeker's videos only
   the first one is handled here. */
const video = ref<Video | null>(null);
const lien = ref('');
const modeEdition = ref(false);
const chargement = ref(false);
const enregistrement = ref(false);
const erreur = ref('');

const idYouTube = computed(() =>
  video.value === null ? null : extraireIdYouTube(video.value.url),
);

watch(
  () => authStore.user?.id,
  (id) => {
    if (id !== undefined) {
      charger(id);
    }
  },
  { immediate: true },
);

async function charger(seekerId: string): Promise<void> {
  chargement.value = true;
  erreur.value = '';

  try {
    const videos = await VideoService.getVideosBySeeker(seekerId);
    appliquer(videos[0] ?? null);
  } catch (err: any) {
    erreur.value = err.message || 'Impossible de charger votre vidéo.';
  } finally {
    chargement.value = false;
  }
}

function appliquer(nouvelle: Video | null): void {
  video.value = nouvelle;
  lien.value = nouvelle?.url ?? '';
  /* A row whose URL we can't read (legacy, or a non-YouTube link) has no
     preview to show, so the field opens instead of leaving an empty card. */
  modeEdition.value = nouvelle === null || extraireIdYouTube(nouvelle.url) === null;
  emit('video-presente', nouvelle !== null);
}

async function enregistrer(): Promise<void> {
  const seekerId = authStore.user?.id;
  if (seekerId === undefined) {
    erreur.value = 'Vous devez être connecté pour ajouter votre vidéo.';
    return;
  }

  const id = extraireIdYouTube(lien.value);
  if (id === null) {
    erreur.value = "Ce lien n'est pas une vidéo YouTube reconnue.";
    return;
  }

  /* The pasted link is normalised before being stored: one video, one row. */
  const url = urlPubliqueYouTube(id);

  enregistrement.value = true;
  erreur.value = '';

  try {
    appliquer(
      video.value === null
        ? await VideoService.createVideo(seekerId, url)
        : await VideoService.updateVideo(video.value.id, { url }),
    );
  } catch (err: any) {
    erreur.value = err.message || "Erreur lors de l'enregistrement de la vidéo.";
  } finally {
    enregistrement.value = false;
  }
}

async function supprimer(): Promise<void> {
  if (video.value === null) {
    return;
  }

  enregistrement.value = true;
  erreur.value = '';

  try {
    await VideoService.deleteVideo(video.value.id);
    appliquer(null);
  } catch (err: any) {
    erreur.value = err.message || 'Erreur lors de la suppression de la vidéo.';
  } finally {
    enregistrement.value = false;
  }
}
</script>

<template>
  <section class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-5">
    <h2 class="text-[18px]">Ma vidéo de présentation</h2>

    <Message v-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>

    <p v-if="chargement" class="text-[14px] text-ink-muted">Chargement…</p>

    <div v-else-if="idYouTube !== null" class="flex flex-col gap-3">
      <LecteurYouTube :id-you-tube="idYouTube" titre="Ma vidéo de présentation" />

      <div class="flex items-center gap-3">
        <Button
          label="Modifier le lien"
          severity="secondary"
          outlined
          class="flex-1 justify-center rounded-control font-heading text-[14px] font-semibold"
          @click="modeEdition = true"
        />
        <Button
          severity="secondary"
          outlined
          aria-label="Supprimer ma vidéo"
          :disabled="enregistrement"
          class="rounded-control"
          @click="supprimer"
        >
          <svg class="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </Button>
      </div>
    </div>

    <div v-if="modeEdition" class="flex flex-col gap-2">
      <label for="lien-video" class="font-heading text-[15px] font-semibold text-brand">
        Lien YouTube de votre vidéo
      </label>
      <InputText
        id="lien-video"
        v-model="lien"
        type="url"
        placeholder="https://www.youtube.com/watch?v=…"
        class="w-full"
      />
      <p class="text-[13px] text-ink-muted">
        Deux minutes maximum. Seules les vidéos YouTube sont acceptées.
      </p>
      <Button
        label="Enregistrer le lien"
        :disabled="enregistrement || lien.trim() === ''"
        class="mt-1 justify-center rounded-control font-heading text-[14px] font-bold"
        @click="enregistrer"
      />
    </div>
  </section>
</template>
