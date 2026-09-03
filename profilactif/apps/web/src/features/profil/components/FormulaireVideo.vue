<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import VideoService from '@/services/VideoService'
import { useAuthStore } from '@/shared/stores/auth'
import type { Video } from '@/shared/types/api'

const authStore = useAuthStore()

const videos = ref<Video[]>([])
const title = ref('')
const url = ref('')
const description = ref('')
const editingId = ref<string | null>(null)
const isLoading = ref(false)
const isSaving = ref(false)
const error = ref('')
const success = ref('')

const isEditing = computed(() => editingId.value !== null)

function resetForm(): void {
  editingId.value = null
  title.value = ''
  url.value = ''
  description.value = ''
}

async function loadVideos(): Promise<void> {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour gérer vos vidéos.'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    videos.value = await VideoService.getVideosBySeeker(authStore.user.id)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement des vidéos'
  } finally {
    isLoading.value = false
  }
}

function editVideo(video: Video): void {
  editingId.value = video.id
  title.value = video.title ?? ''
  url.value = video.url
  description.value = video.description ?? ''
  success.value = ''
  error.value = ''
}

async function saveVideo(): Promise<void> {
  if (!authStore.user?.id) {
    error.value = 'Vous devez être connecté pour gérer vos vidéos.'
    return
  }

  if (!url.value.trim()) {
    error.value = 'Renseignez le lien de la vidéo.'
    return
  }

  try {
    isSaving.value = true
    error.value = ''
    success.value = ''

    const payload = {
      url: url.value.trim(),
      title: title.value.trim() || null,
      description: description.value.trim() || null,
    }

    if (editingId.value) {
      await VideoService.updateVideo(editingId.value, payload)
      success.value = 'Vidéo mise à jour.'
    } else {
      await VideoService.createVideo(
        authStore.user.id,
        payload.url,
        payload.title,
        payload.description,
      )
      success.value = 'Vidéo ajoutée.'
    }

    resetForm()
    await loadVideos()
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la sauvegarde de la vidéo'
  } finally {
    isSaving.value = false
  }
}

async function deleteVideo(video: Video): Promise<void> {
  try {
    isSaving.value = true
    error.value = ''
    success.value = ''
    await VideoService.deleteVideo(video.id)
    success.value = 'Vidéo supprimée.'
    if (editingId.value === video.id) resetForm()
    await loadVideos()
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la suppression de la vidéo'
  } finally {
    isSaving.value = false
  }
}

onMounted(loadVideos)
</script>

<template>
  <section class="space-y-6">
    <form class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm" @submit.prevent="saveVideo">
      <h2 class="text-2xl font-bold text-gray-900">Mes vidéos</h2>

      <p v-if="error" class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
        {{ error }}
      </p>
      <p v-if="success" class="mt-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
        {{ success }}
      </p>

      <div class="mt-6 space-y-4">
        <div>
          <label for="video-title" class="mb-2 block text-sm font-semibold text-gray-700">
            Titre
          </label>
          <input
            id="video-title"
            v-model="title"
            maxlength="200"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Présentation, parcours, motivation..."
          />
        </div>

        <div>
          <label for="video-url" class="mb-2 block text-sm font-semibold text-gray-700">
            Lien de la vidéo
          </label>
          <input
            id="video-url"
            v-model="url"
            type="url"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div>
          <label for="video-description" class="mb-2 block text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            id="video-description"
            v-model="description"
            maxlength="1000"
            rows="4"
            class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Ajoutez quelques détails sur cette vidéo."
          />
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="submit"
          :disabled="isSaving"
          class="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
        >
          {{ isSaving ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Ajouter la vidéo' }}
        </button>
        <button
          v-if="isEditing"
          type="button"
          class="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-700"
          @click="resetForm"
        >
          Annuler
        </button>
      </div>
    </form>

    <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h3 class="text-xl font-bold text-gray-900">Vidéos enregistrées</h3>

      <p v-if="isLoading" class="mt-4 text-gray-600">Chargement des vidéos...</p>
      <p v-else-if="videos.length === 0" class="mt-4 text-gray-600">
        Aucune vidéo enregistrée pour le moment.
      </p>

      <ul v-else class="mt-4 divide-y divide-gray-200">
        <li v-for="video in videos" :key="video.id" class="py-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div class="min-w-0">
              <h4 class="font-semibold text-gray-900">{{ video.title || 'Vidéo sans titre' }}</h4>
              <a :href="video.url" target="_blank" rel="noreferrer" class="break-all text-sm text-blue-600 hover:underline">
                {{ video.url }}
              </a>
              <p v-if="video.description" class="mt-2 text-sm text-gray-600">
                {{ video.description }}
              </p>
            </div>

            <div class="flex shrink-0 gap-2">
              <button type="button" class="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700" @click="editVideo(video)">
                Modifier
              </button>
              <button type="button" class="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700" @click="deleteVideo(video)">
                Supprimer
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
