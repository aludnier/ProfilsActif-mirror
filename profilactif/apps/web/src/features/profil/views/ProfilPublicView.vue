<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProfileService from '@/services/ProfileService'
import type { Profile } from '@/shared/types/api'

const route = useRoute()
const profile = ref<Profile | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const id = route.params.id as string

async function loadProfile() {
  loading.value = true
  error.value = null

  try {
    profile.value = await ProfileService.getProfile(id)
  } catch (err: any) {
    error.value = err.message || 'Profil non trouvé'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Chargement -->
      <div v-if="loading" class="flex justify-center">
        <div class="text-gray-500">Chargement du profil...</div>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ error }}
      </div>

      <!-- Profil -->
      <div v-else-if="profile" class="bg-white rounded-lg shadow-lg p-8">
        <div class="flex flex-col md:flex-row gap-8">
          <!-- Informations principales -->
          <div class="flex-1">
            <h1 class="text-4xl font-bold mb-2">
              {{ profile.firstName }} {{ profile.lastName }}
            </h1>

            <div class="space-y-4 text-gray-700">
              <div v-if="profile.phone" class="flex items-center gap-2">
                <span class="font-semibold">Téléphone :</span>
                <a :href="`tel:${profile.phone}`" class="text-blue-500 hover:underline">
                  {{ profile.phone }}
                </a>
              </div>

              <div v-if="profile.age" class="flex items-center gap-2">
                <span class="font-semibold">Âge :</span>
                <span>{{ profile.age }} ans</span>
              </div>

              <div v-if="profile.location" class="flex items-center gap-2">
                <span class="font-semibold">Localisation :</span>
                <span>{{ profile.location }}</span>
              </div>

              <div v-if="profile.targetSector" class="flex items-center gap-2">
                <span class="font-semibold">Secteur ciblé :</span>
                <span>{{ profile.targetSector }}</span>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-semibold">Email :</span>
                <a :href="`mailto:${profile.mail}`" class="text-blue-500 hover:underline">
                  {{ profile.mail }}
                </a>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-semibold">Rôle :</span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-semibold',
                    profile.role === 'seeker' && 'bg-blue-100 text-blue-800',
                    profile.role === 'recruiter' && 'bg-green-100 text-green-800',
                    profile.role === 'admin' && 'bg-red-100 text-red-800',
                  ]"
                >
                  {{
                    profile.role === 'seeker'
                      ? 'Candidat'
                      : profile.role === 'recruiter'
                        ? 'Recruteur'
                        : 'Administrateur'
                  }}
                </span>
              </div>

              <div class="flex items-center gap-2">
                <span class="font-semibold">Inscrit le :</span>
                <span>{{ new Date(profile.createdAt).toLocaleDateString('fr-FR') }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="md:w-64 space-y-3">
            <button
              type="button"
              class="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Ajouter aux favoris
            </button>

            <button
              type="button"
              class="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
            >
              Contacter
            </button>

            <button
              type="button"
              class="w-full px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-lg transition-colors"
            >
              Partager
            </button>
          </div>
        </div>
      </div>

      <!-- Pas de profil -->
      <div v-else class="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 class="text-2xl font-bold text-gray-800">Profil non trouvé</h2>
      </div>
    </div>
  </div>
</template>
