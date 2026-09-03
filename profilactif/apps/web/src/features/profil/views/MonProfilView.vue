<script setup lang="ts">
import { ref } from 'vue'
import BarreLateraleCandidat from '@/features/profil/components/BarreLateraleCandidat.vue'
import FormulaireProfil from '@/features/profil/components/FormulaireProfil.vue'
import FormulaireVideo from '@/features/profil/components/FormulaireVideo.vue'

const currentTab = ref<'profile' | 'videos' | 'certifications'>('profile')
</script>

<template>
  <div class="flex items-stretch min-h-screen">
    <BarreLateraleCandidat />

    <section class="min-w-0 flex-1 p-10">
      <div class="max-w-4xl">
        <h1 class="text-4xl font-bold mb-8">Mon Profil</h1>

        <!-- Onglets -->
        <div class="flex border-b border-gray-300 mb-8">
          <button
            @click="currentTab = 'profile'"
            :class="[
              'px-6 py-3 font-semibold border-b-2 transition-colors',
              currentTab === 'profile'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 hover:text-gray-800',
            ]"
          >
            Profil
          </button>
          <button
            @click="currentTab = 'videos'"
            :class="[
              'px-6 py-3 font-semibold border-b-2 transition-colors',
              currentTab === 'videos'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 hover:text-gray-800',
            ]"
          >
            Vidéos
          </button>
          <button
            @click="currentTab = 'certifications'"
            :class="[
              'px-6 py-3 font-semibold border-b-2 transition-colors',
              currentTab === 'certifications'
                ? 'border-blue-500 text-blue-500'
                : 'border-transparent text-gray-600 hover:text-gray-800',
            ]"
          >
            Certifications
          </button>
        </div>

        <!-- Contenu des onglets -->
        <div v-if="currentTab === 'profile'" class="space-y-6">
          <FormulaireProfil />
        </div>

        <div v-else-if="currentTab === 'videos'" class="space-y-6">
          <FormulaireVideo />
        </div>

        <div v-else-if="currentTab === 'certifications'" class="space-y-6">
          <p class="text-gray-600">Les certifications seront gérées ici.</p>
        </div>
      </div>
    </section>
  </div>
</template>
