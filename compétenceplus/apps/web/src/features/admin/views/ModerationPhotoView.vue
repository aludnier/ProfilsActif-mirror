<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { onMounted, onUnmounted, ref } from 'vue';

import AdminService from '@/features/admin/api';
import NavAdmin from '@/features/admin/components/NavAdmin.vue';
import ProfileService from '@/services/ProfileService';
import type { PhotoEnAttente } from '@/shared/types/api';

const photos = ref<PhotoEnAttente[]>([]);
/*
 * Les images sont chargées avec le jeton, puis conservées comme URL d'objet :
 * une photo en attente n'est pas servie à une balise `<img>` nue, qui n'envoie
 * pas d'en-tête Authorization.
 */
const apercus = ref<Record<string, string>>({});

const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref('');

function libererApercus(): void {
  Object.values(apercus.value).forEach((url) => URL.revokeObjectURL(url));
  apercus.value = {};
}

async function charger(): Promise<void> {
  loading.value = true;
  error.value = '';

  try {
    photos.value = await AdminService.getPendingPhotos();
    libererApercus();

    /* En parallèle : une file de dix photos ferait sinon dix allers-retours
       en série avant le premier affichage. */
    const chargees = await Promise.all(
      photos.value.map(
        async (photo) =>
          [photo.seekerId, await ProfileService.getPhotoBlob(photo.seekerId)] as const,
      ),
    );

    apercus.value = Object.fromEntries(
      chargees.filter((entree): entree is readonly [string, string] => entree[1] !== null),
    );
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger les photos en attente.';
  } finally {
    loading.value = false;
  }
}

async function moderer(photo: PhotoEnAttente, status: 'approved' | 'rejected'): Promise<void> {
  saving.value = true;
  error.value = '';
  success.value = '';

  try {
    await AdminService.moderatePhoto(photo.seekerId, status);
    /* Retirée de la file : elle n'est plus en attente. */
    photos.value = photos.value.filter((item) => item.seekerId !== photo.seekerId);
    const apercu = apercus.value[photo.seekerId];
    if (apercu) URL.revokeObjectURL(apercu);
    success.value =
      status === 'approved'
        ? `Photo de ${photo.firstName} ${photo.lastName} acceptée.`
        : `Photo de ${photo.firstName} ${photo.lastName} refusée.`;
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de modifier le statut de la photo.';
  } finally {
    saving.value = false;
  }
}

function formaterDate(valeur: string): string {
  return new Date(valeur).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
}

onMounted(() => {
  void charger();
});

/* Sans ça, chaque visite de l'écran laisserait ses images en mémoire. */
onUnmounted(libererApercus);
</script>

<template>
  <main class="min-h-screen bg-surface-subtle p-6 lg:p-10">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <NavAdmin />

      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-[28px] text-brand">Validation photo</h1>
          <p class="text-[15px] text-ink-muted">
            Photos de profil en attente d'une décision de modération.
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
          <h2 class="text-[19px]">Photos en attente de validation</h2>
          <p class="text-[14px] font-normal text-ink-muted">
            {{ photos.length }} photo(s) à traiter
          </p>
        </template>

        <template #content>
          <p v-if="photos.length === 0" class="text-[14px] text-ink-muted">
            Aucune photo en attente.
          </p>

          <div
            v-for="photo in photos"
            :key="photo.seekerId"
            class="flex flex-wrap items-center gap-5 border-t border-surface-line pt-5"
          >
            <img
              v-if="apercus[photo.seekerId]"
              :src="apercus[photo.seekerId]"
              :alt="`Photo proposée par ${photo.firstName} ${photo.lastName}`"
              class="size-28 shrink-0 rounded-card object-cover"
            />
            <!-- Fichier absent du disque : la base garde la trace, l'image non. -->
            <span
              v-else
              class="flex size-28 shrink-0 items-center justify-center rounded-card bg-surface-muted text-center font-heading text-[12px] text-ink-muted"
            >
              Image indisponible
            </span>

            <div class="flex min-w-0 flex-1 flex-col gap-2">
              <h3 class="font-heading font-bold text-brand">
                {{ photo.firstName }} {{ photo.lastName }}
              </h3>
              <p class="text-[13px] text-ink-muted">
                Envoyée le {{ formaterDate(photo.updatedAt) }}
              </p>
              <Tag
                rounded
                value="En attente de validation"
                class="self-start bg-action-100 px-2 py-1 font-heading text-[12px] font-bold text-action-700"
              />
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                label="Accepter"
                class="rounded-control"
                :disabled="saving"
                @click="moderer(photo, 'approved')"
              />
              <Button
                label="Refuser"
                severity="danger"
                outlined
                class="rounded-control"
                :disabled="saving"
                @click="moderer(photo, 'rejected')"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </main>
</template>
