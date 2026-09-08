<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProfileService from '@/services/ProfileService'
import VideoService from '@/services/VideoService'
import FavoriteService from '@/services/FavoriteService'
import ContactService from '@/services/ContactService'
import { useAuthStore } from '@/shared/stores/auth'
import Button from 'primevue/button'
import EditeurCompetences from '@/features/profil/components/EditeurCompetences.vue'
import FormulaireProfil from '@/features/profil/components/FormulaireProfil.vue'
import type { InfosProfil } from '@/features/profil/components/FormulaireProfil.vue'
import type { Favorite, Profile, Video } from '@/shared/types/api'
import { extraireIdYouTube } from '@/shared/youtube'
import { estCertifie, niveauBadge } from '@/shared/certification'
import BadgeCertification from '@/shared/ui/BadgeCertification.vue'
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
const isAdmin = computed(() => auth.user?.role === 'admin')
const editMode = ref(false)
const editSaving = ref(false)
const editSuccess = ref('')
const editInfos = ref<InfosProfil>({
  firstName: '',
  lastName: '',
  phone: '',
  age: null,
  location: '',
  targetSector: '',
  employmentType: null,
  workMode: null,
  experienceYears: null,
  bio: '',
})
const editCompetences = ref<string[]>([])
const competenceEditMode = ref(false)
const competenceSaving = ref(false)

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

function appliquerEdition(source: Profile): void {
  editInfos.value = {
    firstName: source.firstName,
    lastName: source.lastName,
    phone: source.phone ?? '',
    age: source.age === null ? null : Number(source.age),
    location: source.location ?? '',
    targetSector: source.targetSector ?? '',
    employmentType: source.employmentType,
    workMode: source.workMode,
    experienceYears: source.experienceYears === null ? null : Number(source.experienceYears),
    bio: source.bio ?? '',
  }
}


function ouvrirEditionCompetences(): void {
  competenceEditMode.value = true
  editSuccess.value = ''
}

function fermerEditionCompetences(): void {
  if (!competenceSaving.value) {
    competenceEditMode.value = false
  }
}

async function enregistrerCompetences(): Promise<void> {
  competenceSaving.value = true
  error.value = ''
  editSuccess.value = ''
  try {
    editCompetences.value = await ProfileService.updateCompetences(candidateId, editCompetences.value)
    competenceEditMode.value = false
    editSuccess.value = 'Compétences mises à jour.'
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier les compétences.'
  } finally {
    competenceSaving.value = false
  }
}

function ouvrirEdition(): void {
  if (!profile.value) return
  appliquerEdition(profile.value)
  editSuccess.value = ''
  editMode.value = true
}

async function enregistrerEdition(): Promise<void> {
  if (!profile.value) return
  editSaving.value = true
  error.value = ''
  editSuccess.value = ''
  try {
    profile.value = await ProfileService.updateProfile(profile.value.id, {
      firstName: editInfos.value.firstName,
      lastName: editInfos.value.lastName,
      phone: editInfos.value.phone || null,
      age: editInfos.value.age,
      location: editInfos.value.location,
      targetSector: editInfos.value.targetSector || null,
      employmentType: editInfos.value.employmentType,
      workMode: editInfos.value.workMode,
      experienceYears: editInfos.value.experienceYears,
      bio: editInfos.value.bio || null,
    })
    editCompetences.value = await ProfileService.updateCompetences(profile.value.id, editCompetences.value)
    editMode.value = false
    editSuccess.value = 'Profil candidat mis à jour.'
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier ce profil.'
  } finally {
    editSaving.value = false
  }
}

async function load() {
  try {
    profile.value = await ProfileService.getProfile(candidateId)
    appliquerEdition(profile.value)
    editCompetences.value = await ProfileService.getCompetences(candidateId)
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
        <div class="space-y-1.5">
          <h1 class="text-[26px] text-brand">{{ profile.firstName }} {{ profile.lastName }}</h1>
          <p class="font-heading text-[15px] font-bold">{{ profile.targetSector || 'Candidat disponible' }}</p>
          <p class="text-[13px] italic text-ink-muted">
            {{ profile.location || 'Localisation non renseignee' }} - Profil candidat
          </p>
          <BadgeCertification
            v-if="estCertifie(profile.certificationRate)"
            :level="niveauBadge(profile.certificationRate)"
            :score="profile.certificationRate"
          />
        </div>

        <div class="flex flex-wrap gap-3">
          <Button
            v-if="isAdmin"
            label="Modifier le profil"
            severity="secondary"
            outlined
            class="rounded-control px-5 py-3 font-heading text-[13px] font-bold"
            @click="ouvrirEdition"
          />
          <Button
            v-if="canContact"
            label="Modifier les compétences"
            severity="secondary"
            outlined
            class="rounded-control px-5 py-3 font-heading text-[13px] font-bold"
            @click="ouvrirEditionCompetences"
          />
          <template v-if="canContact">
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
          </template>
        </div>
      </header>

      <section v-if="canContact && competenceEditMode" class="rounded-card border border-brand/30 bg-surface-page p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-[19px] text-brand">Modifier les compétences</h2>
            <p class="text-[14px] text-ink-muted">Ajoutez ou retirez les mots-clés visibles sur ce profil.</p>
          </div>
          <Button
            label="Fermer"
            severity="secondary"
            text
            class="rounded-control"
            :disabled="competenceSaving"
            @click="fermerEditionCompetences"
          />
        </div>
        <form class="flex flex-col gap-5" @submit.prevent="enregistrerCompetences">
          <EditeurCompetences v-model="editCompetences" />
          <div class="flex justify-end gap-3">
            <Button
              label="Annuler"
              severity="secondary"
              outlined
              class="rounded-control"
              :disabled="competenceSaving"
              @click="fermerEditionCompetences"
            />
            <Button
              type="submit"
              label="Enregistrer les compétences"
              class="rounded-control"
              :loading="competenceSaving"
            />
          </div>
        </form>
      </section>

      <section v-if="isAdmin && editMode" class="rounded-card border border-brand/30 bg-surface-page p-6">
        <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-[19px] text-brand">Modifier le profil candidat</h2>
            <p class="text-[14px] text-ink-muted">Les modifications sont enregistrées directement dans le compte.</p>
          </div>
          <Button
            label="Fermer"
            severity="secondary"
            text
            class="rounded-control"
            :disabled="editSaving"
            @click="editMode = false"
          />
        </div>

        <form class="flex flex-col gap-5" @submit.prevent="enregistrerEdition">
          <FormulaireProfil v-model:infos="editInfos" v-model:competences="editCompetences" :desactive="editSaving" />
          <div class="flex justify-end gap-3">
            <Button
              label="Annuler"
              severity="secondary"
              outlined
              class="rounded-control"
              :disabled="editSaving"
              @click="editMode = false"
            />
            <Button
              type="submit"
              label="Enregistrer les modifications"
              class="rounded-control"
              :loading="editSaving"
            />
          </div>
        </form>
      </section>

      <p v-if="editSuccess" class="rounded-control bg-green-50 px-4 py-3 text-[14px] text-green-800">
        {{ editSuccess }}
      </p>

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

          <div v-if="editCompetences.length" class="rounded-card border border-surface-line bg-surface-page p-6">
            <h2 class="font-heading text-[17px] font-bold text-brand">Compétences clés</h2>
            <ul class="mt-4 flex flex-wrap gap-2">
              <li
                v-for="competence in editCompetences"
                :key="competence"
                class="rounded-badge bg-surface-muted px-3 py-1.5 font-heading text-[12px] font-medium text-brand"
              >
                {{ competence }}
              </li>
            </ul>
          </div>

          <div class="rounded-card border border-surface-line bg-surface-page p-6">
            <h2 class="font-heading text-[17px] font-bold text-brand">A propos de mon parcours</h2>
            <p class="mt-5 space-y-4 text-[14px]">
              {{ profile.bio || (profile.firstName + ' ' + profile.lastName + ' est disponible pour échanger sur son parcours et ses compétences.') }}
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
