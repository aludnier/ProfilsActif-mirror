<script setup lang="ts">
import { ref, watch } from 'vue';

import { urlIntegrationYouTube } from '@/shared/youtube';

const props = defineProps<{ idYouTube: string; titre?: string }>();

/* The iframe is only inserted on click: a YouTube frame contacts Google and
   sets cookies as soon as it exists. */
const ouvert = ref(false);

watch(
  () => props.idYouTube,
  () => {
    ouvert.value = false;
  },
);
</script>

<template>
  <!-- `autoplay` is delegated on purpose: the src asks for autoplay=1, and a
       cross-origin iframe without it stays paused — the click landed on our
       button, not inside the frame. -->
  <iframe
    v-if="ouvert"
    :src="urlIntegrationYouTube(idYouTube)"
    :title="titre ?? 'Vidéo de présentation'"
    class="aspect-video w-full rounded-media"
    allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
    allowfullscreen
  />

  <button
    v-else
    type="button"
    class="flex aspect-video w-full items-center justify-center rounded-media bg-brand"
    @click="ouvert = true"
  >
    <span class="sr-only">Lire la vidéo de présentation</span>
    <span class="flex size-16 items-center justify-center rounded-full bg-action">
      <svg class="size-7 translate-x-0.5" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5v14l11-7z" fill="var(--color-on-action)" />
      </svg>
    </span>
  </button>
</template>
