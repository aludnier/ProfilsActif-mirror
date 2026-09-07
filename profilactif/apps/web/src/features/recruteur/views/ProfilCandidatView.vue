<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProfileService from '@/services/ProfileService'
import VideoService from '@/services/VideoService'
import FavoriteService from '@/services/FavoriteService'
import ContactService from '@/services/ContactService'
import { useAuthStore } from '@/shared/stores/auth'
import type { Favorite, Profile, Video } from '@/shared/types/api'
import { extraireIdYouTube } from '@/shared/youtube'
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue'

const route = useRoute()
const auth = useAuthStore()
const profile = ref<Profile | null>(null)
const videos = ref<Video[]>([])
const favorite = ref<Favorite | null>(null)
const message = ref('')
const showContact = ref(false)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const candidateId = route.params.id as string
const canContact = computed(() => auth.user?.role === 'recruiter' && !!auth.user?.id)

const TYPE_CONTRAT: Record<string, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  internship: 'Stage / alternance',
}

const MODE_TRAVAIL: Record<string, string> = {
  on_site: 'Présentiel',
  hybrid: 'Hybride',
  remote: 'Télétravail',
}

function libelleContrat(value: string | null): string {
  return value === null ? 'Non renseigné' : TYPE_CONTRAT[value] ?? value
}

function libelleMode(value: string | null): string {
  return value === null ? 'Non renseignée' : MODE_TRAVAIL[value] ?? value
}

function libelleExperience(value: number | null): string {
  return value === null ? 'Non renseignée' : String(value).replace('.0', '') + ' ans'
}

async function load() {
  try {
    profile.value = await ProfileService.getProfile(candidateId)
    if (auth.user?.id && auth.user.role === 'recruiter') {
      const key = 'recruiter-viewed-' + auth.user.id
      const viewed = JSON.parse(localStorage.getItem(key) || '[]') as string[]
      if (!viewed.includes(candidateId)) localStorage.setItem(key, JSON.stringify([...viewed, candidateId]))
    }
    videos.value = await VideoService.getVideosBySeeker(candidateId)

    if (auth.user?.id && auth.user.role === 'recruiter') {
      const favorites = await FavoriteService.getFavoritesByRecruiter(auth.user.id)
      favorite.value = favorites.find((item) => item.seekerId === candidateId) ?? null
    }
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger ce profil.'
  } finally {
    loading.value = false
  }
}

async function toggleFavorite() {
  if (!auth.user?.id) return
  saving.value = true
  try {
    if (favorite.value) {
      await FavoriteService.deleteFavorite(favorite.value.id)
      favorite.value = null
    } else {
      favorite.value = await FavoriteService.createFavorite(auth.user.id, candidateId)
    }
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier les favoris.'
  } finally {
    saving.value = false
  }
}

async function contact() {
  if (!auth.user?.id || !message.value.trim()) return
  saving.value = true
  try {
    await ContactService.createContact(auth.user.id, candidateId, message.value.trim())
    message.value = ''
    showContact.value = false
  } catch (err: any) {
    error.value = err.message || 'Impossible d envoyer le contact.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (auth.isLoading) {
    const stop = watch(() => auth.isLoading, (isLoading) => {
      if (!isLoading) {
        stop()
        void load()
      }
    })
  } else {
    void load()
  }
})
</script>

<template>
  <main class="min-h-screen bg-surface-subtle px-gutter py-10">
    <div v-if="loading" class="mx-auto max-w-6xl py-16 text-center text-ink-muted">
      Chargement du profil...
    </div>

    <div v-else-if="error" class="mx-auto max-w-6xl rounded-card border border-red-200 bg-red-50 p-5 text-red-700">
      {{ error }}
    </div>

    <div v-else-if="profile" class="mx-auto max-w-6xl space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-5 rounded-card border border-surface-line bg-surface-page p-6">
        <div>
          <h1 class="text-[26px] text-brand">{{ profile.firstName }} {{ profile.lastName }}</h1>
          <p class="font-heading text-[15px] font-bold">{{ profile.targetSector || 'Candidat disponible' }}</p>
          <p class="text-[13px] italic text-ink-muted">
            {{ profile.location || 'Localisation non renseignee' }} - Profil candidat
          </p>
        </div>

        <div v-if="canContact" class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-control bg-brand-50 px-5 py-3 font-heading text-[13px] font-bold text-brand"
            :disabled="saving"
            @click="toggleFavorite"
          >
            {{ favorite ? 'Retirer des favoris' : 'Ajouter aux favoris' }}
          </button>
          <button
            type="button"
            class="rounded-control bg-action px-5 py-3 font-heading text-[13px] font-bold text-white"
            @click="showContact = !showContact"
          >
            Contacter
          </button>
        </div>
      </header>

      <div v-if="showContact" class="rounded-card border border-surface-line bg-surface-page p-6">
        <label for="contact-message" class="font-heading text-[14px] font-bold text-brand">
          Votre message
        </label>
        <textarea
          id="contact-message"
          v-model="message"
          class="mt-3 min-h-28 w-full rounded-control border border-surface-line p-3"
          placeholder="Presentez votre opportunite..."
        />
        <button
          type="button"
          class="mt-3 rounded-control bg-action px-5 py-3 font-heading text-[13px] font-bold text-white"
          :disabled="saving || !message.trim()"
          @click="contact"
        >
          {{ saving ? 'Envoi...' : 'Envoyer le message' }}
        </button>
      </div>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <section class="space-y-6">
          <div v-if="videos.length" class="overflow-hidden rounded-card border border-surface-line bg-black">
            <LecteurYouTube
              v-if="extraireIdYouTube(videos[0].url)"
              :id-you-tube="extraireIdYouTube(videos[0].url)!"
              :titre="videos[0].title || 'Vidéo de présentation'"
            />
            <video v-else :src="videos[0].url" controls preload="metadata" class="aspect-video w-full" />
          </div>

          <div class="rounded-card border border-surface-line bg-surface-page p-6">
            <h2 class="font-heading text-[17px] font-bold text-brand">A propos de mon parcours</h2>
            <p class="mt-4 text-[15px] leading-7 text-ink-muted">
              {{ profile.firstName }} {{ profile.lastName }} est disponible pour echanger sur son parcours et ses competences.
            </p>
          </div>

          <div v-if="videos.length > 1" class="rounded-card border border-surface-line bg-surface-page p-6">
            <h2 class="font-heading text-[17px] font-bold text-brand">Videos de presentation</h2>
            <div class="mt-5 space-y-5">
              <div v-for="video in videos" :key="video.id" class="border-b border-surface-line pb-5 last:border-0 last:pb-0">
                <h3 class="font-heading font-bold text-brand">{{ video.title || 'Presentation video' }}</h3>
                <p v-if="video.description" class="mt-1 text-[14px] text-ink-muted">{{ video.description }}</p>
                <LecteurYouTube
                  v-if="extraireIdYouTube(video.url)"
                  :id-you-tube="extraireIdYouTube(video.url)!"
                  :titre="video.title || 'Vidéo de présentation'"
                  class="mt-3"
                />
                <video v-else :src="video.url" controls preload="metadata" class="mt-3 aspect-video w-full rounded-control bg-black" />
              </div>
            </div>
          </div>
        </section>

        <aside class="rounded-card border border-surface-line bg-surface-page p-6">
          <h2 class="font-heading text-[12px] font-bold uppercase text-ink-muted">Informations du profil</h2>
          <dl class="mt-5 space-y-4 text-[14px]">
            <div>
              <dt class="font-bold text-brand">Secteur recherche</dt>
              <dd>{{ profile.targetSector || 'Non renseigne' }}</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Localisation</dt>
              <dd>{{ profile.location || 'Non renseignee' }}</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Type de contrat</dt>
              <dd>{{ libelleContrat(profile.employmentType) }}</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Modalite</dt>
              <dd>{{ libelleMode(profile.workMode) }}</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Experience</dt>
              <dd>{{ libelleExperience(profile.experienceYears) }}</dd>
            </div>
            <div v-if="profile.age">
              <dt class="font-bold text-brand">Age</dt>
              <dd>{{ profile.age }} ans</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Certification</dt>
              <dd>{{ profile.certificationRate }} %</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Coordonnees</dt>
              <dd>{{ profile.mail }}</dd>
              <dd v-if="profile.phone">{{ profile.phone }}</dd>
            </div>
            <div>
              <dt class="font-bold text-brand">Profil actif depuis</dt>
              <dd>{{ new Date(profile.createdAt).toLocaleDateString('fr-FR') }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  </main>
</template>
