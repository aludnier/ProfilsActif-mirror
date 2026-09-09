<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { onMounted, ref } from 'vue';

import AdminService from '@/features/admin/api';
import NavAdmin from '@/features/admin/components/NavAdmin.vue';
import type { Video } from '@/shared/types/api';
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue';
import { extraireIdYouTube } from '@/shared/youtube';

const videos = ref<Video[]>([]);
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref('');

async function charger(): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    videos.value = await AdminService.getPendingVideos();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger les vidéos en attente.';
  } finally {
    loading.value = false;
  }
}

async function moderer(video: Video, status: 'approved' | 'rejected'): Promise<void> {
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    await AdminService.moderateVideo(video.id, status);
    /* Retirée de la liste : elle n'est plus « en attente », la recharger
       coûterait un aller-retour pour le même résultat. */
    videos.value = videos.value.filter((item) => item.id !== video.id);
    success.value = status === 'approved' ? 'Vidéo acceptée.' : 'Vidéo refusée.';
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de modifier le statut de la vidéo.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void charger();
});
</script>

<template>
  <main class="min-h-screen bg-surface-subtle p-6 lg:p-10">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <NavAdmin />

      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-[28px] text-brand">Validation vidéo</h1>
          <p class="text-[15px] text-ink-muted">
            Vidéos de présentation en attente d'une décision de modération.
          </p>
        </div>
        <Button
          label="Actualiser"
          severity="secondary"
          outlined
          class="rounded-control"
          :loading="loading"
          @click="charger"
        />
      </header>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

      <p v-if="loading" class="text-[15px] text-ink-muted">Chargement...</p>

      <Card v-else class="rounded-card border border-surface-line">
        <template #title>
          <h2 class="text-[19px]">Vidéos en attente de validation</h2>
          <p class="text-[14px] font-normal text-ink-muted">
            {{ videos.length }} vidéo(s) à traiter
          </p>
        </template>

        <template #content>
          <p v-if="videos.length === 0" class="text-[14px] text-ink-muted">
            Aucune vidéo en attente.
          </p>

          <div
            v-for="video in videos"
            :key="video.id"
            class="grid gap-5 border-t border-surface-line pt-5 lg:grid-cols-[minmax(0,1fr)_260px]"
          >
            <div>
              <LecteurYouTube
                v-if="extraireIdYouTube(video.url)"
                :id-you-tube="extraireIdYouTube(video.url)!"
                :titre="video.title || 'Vidéo à modérer'"
              />
              <video
                v-else
                :src="video.url"
                controls
                preload="metadata"
                class="aspect-video w-full rounded-control bg-black"
              />
            </div>

            <div class="flex flex-col gap-3">
              <h3 class="font-heading font-bold text-brand">
                {{ video.title || 'Vidéo de présentation' }}
              </h3>
              <p v-if="video.description" class="text-[14px] text-ink-muted">
                {{ video.description }}
              </p>
              <Tag
                rounded
                value="En attente de validation"
                class="self-start bg-action-100 px-2 py-1 font-heading text-[12px] font-bold text-action-700"
              />
              <div class="mt-auto flex flex-wrap gap-2">
                <Button
                  label="Accepter"
                  class="rounded-control"
                  :disabled="saving"
                  @click="moderer(video, 'approved')"
                />
                <Button
                  label="Refuser"
                  severity="danger"
                  outlined
                  class="rounded-control"
                  :disabled="saving"
                  @click="moderer(video, 'rejected')"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
