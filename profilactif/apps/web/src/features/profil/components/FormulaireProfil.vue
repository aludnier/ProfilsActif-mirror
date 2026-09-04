<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/shared/stores/auth'
import ProfileService from '@/services/ProfileService'
import type { Profile, UpdateProfileInput } from '@/shared/types/api'

const authStore = useAuthStore()

const profile = ref<Profile | null>(null)
const loading = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Formulaire
const firstName = ref('')
const lastName = ref('')
const phone = ref('')
const age = ref<number | null>(null)
const location = ref('')
const targetSector = ref('')
const employmentType = ref<UpdateProfileInput['employmentType']>(null)
const workMode = ref<UpdateProfileInput['workMode']>(null)
const experienceYears = ref<number | null>(null)

const isChanged = computed(() => {
  if (!profile.value) return false
  return (
    firstName.value !== profile.value.firstName ||
    lastName.value !== profile.value.lastName ||
    phone.value !== (profile.value.phone ?? '') ||
    age.value !== profile.value.age ||
    location.value !== (profile.value.location ?? '') ||
    targetSector.value !== (profile.value.targetSector ?? '') ||
    employmentType.value !== profile.value.employmentType ||
    workMode.value !== profile.value.workMode ||
    experienceYears.value !== profile.value.experienceYears
  )
})

// Charger le profil
async function loadProfile() {
  if (!authStore.user?.id) return

  loading.value = true
  error.value = null

  try {
    profile.value = await ProfileService.getProfile(authStore.user.id)
    // Remplir le formulaire
    firstName.value = profile.value.firstName
    lastName.value = profile.value.lastName
    phone.value = profile.value.phone ?? ''
    age.value = profile.value.age
    location.value = profile.value.location ?? ''
    targetSector.value = profile.value.targetSector ?? ''
    employmentType.value = profile.value.employmentType
    workMode.value = profile.value.workMode
    experienceYears.value = profile.value.experienceYears
  } catch (err: any) {
    error.value = err.message || 'Erreur lors du chargement du profil'
  } finally {
    loading.value = false
  }
}

// Sauvegarder le profil
async function saveProfile() {
  if (!authStore.user?.id || !isChanged.value) return

  submitting.value = true
  error.value = null
  success.value = null

  try {
    const updates: UpdateProfileInput = {}

    if (firstName.value !== profile.value?.firstName) updates.firstName = firstName.value
    if (lastName.value !== profile.value?.lastName) updates.lastName = lastName.value
    if (phone.value !== (profile.value?.phone ?? '')) {
      updates.phone = phone.value || null
    }
    if (age.value !== profile.value?.age) updates.age = age.value
    if (location.value !== (profile.value?.location ?? '')) updates.location = location.value
    if (targetSector.value !== (profile.value?.targetSector ?? '')) {
      updates.targetSector = targetSector.value || null
    }
    if (employmentType.value !== profile.value?.employmentType) updates.employmentType = employmentType.value
    if (workMode.value !== profile.value?.workMode) updates.workMode = workMode.value
    if (experienceYears.value !== profile.value?.experienceYears) updates.experienceYears = experienceYears.value

    const updated = await ProfileService.updateProfile(authStore.user.id, updates)
    profile.value = updated
    
    // Mettre à jour le store auth avec les nouvelles infos
    authStore.updateUser({
      firstName: updated.firstName,
      lastName: updated.lastName,
    })

    success.value = 'Profil mis à jour avec succès'
    setTimeout(() => {
      success.value = null
    }, 3000)
  } catch (err: any) {
    error.value = err.message || 'Erreur lors de la sauvegarde'
  } finally {
    submitting.value = false
  }
}

// Charger le profil au montage
watch(
  () => authStore.user?.id,
  () => {
    if (authStore.user?.id) {
      loadProfile()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-6">
    <!-- Messages -->
    <div v-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
      {{ error }}
    </div>

    <div v-if="success" class="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
      {{ success }}
    </div>

    <!-- Chargement -->
    <div v-if="loading" class="flex justify-center">
      <div class="text-gray-500">Chargement du profil...</div>
    </div>

    <!-- Formulaire -->
    <form v-else @submit.prevent="saveProfile" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <input
            id="firstName"
            v-model="firstName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="submitting"
          />
        </div>

        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
            Nom
          </label>
          <input
            id="lastName"
            v-model="lastName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="submitting"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            Téléphone
          </label>
          <input
            id="phone"
            v-model="phone"
            type="tel"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="submitting"
          />
        </div>

        <div>
          <label for="age" class="block text-sm font-medium text-gray-700 mb-2">
            Âge
          </label>
          <input
            id="age"
            v-model.number="age"
            type="number"
            min="0"
            max="120"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="submitting"
          />
        </div>
      </div>

      <div>
        <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
          Localisation
        </label>
        <input
          id="location"
          v-model="location"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="submitting"
        />
      </div>

      <div>
        <label for="targetSector" class="block text-sm font-medium text-gray-700 mb-2">
          Secteur ciblé
        </label>
        <input
          id="targetSector"
          v-model="targetSector"
          type="text"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="submitting"
        />
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label for="employmentType" class="mb-2 block text-sm font-medium text-gray-700">Type de contrat</label>
          <select id="employmentType" v-model="employmentType" class="w-full rounded-lg border border-gray-300 px-4 py-2">
            <option :value="null">Non renseigne</option>
            <option value="full_time">Temps plein</option>
            <option value="part_time">Temps partiel</option>
            <option value="freelance">Freelance</option>
            <option value="internship">Stage / alternance</option>
          </select>
        </div>
        <div>
          <label for="workMode" class="mb-2 block text-sm font-medium text-gray-700">Modalite</label>
          <select id="workMode" v-model="workMode" class="w-full rounded-lg border border-gray-300 px-4 py-2">
            <option :value="null">Non renseignee</option>
            <option value="on_site">Presentiel</option>
            <option value="hybrid">Hybride</option>
            <option value="remote">Teletravail</option>
          </select>
        </div>
        <div>
          <label for="experienceYears" class="mb-2 block text-sm font-medium text-gray-700">Experience (annees)</label>
          <input id="experienceYears" v-model.number="experienceYears" type="number" min="0" max="60" step="0.5" class="w-full rounded-lg border border-gray-300 px-4 py-2" />
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button
          type="submit"
          :disabled="!isChanged || submitting"
          class="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
        >
          {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
        </button>

        <button
          type="button"
          @click="loadProfile"
          :disabled="submitting"
          class="px-6 py-2 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>
