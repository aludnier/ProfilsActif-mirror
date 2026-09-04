<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { computed, onMounted, ref } from 'vue'

import ProfileService from '@/services/ProfileService'
import heroStudio from '@/assets/images/hero-studio.webp'
import EnteteCatalogue from '@/features/recruteur/components/EnteteCatalogue.vue'
import FiltresCatalogue from '@/features/recruteur/components/FiltresCatalogue.vue'
import GrilleCandidats from '@/features/recruteur/components/GrilleCandidats.vue'
import { formaterNombre } from '@/shared/formatage'
import type { Profile } from '@/shared/types/api'
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue'

const profiles = ref<Profile[]>([])
const loading = ref(true)
const error = ref('')
const niveau = ref('all')
const types = ref<string[]>([])
const modalites = ref<string[]>([])
const premierProfil = ref(0)

const niveauLabels: Record<string, string> = {
  junior: 'Junior (0 - 2 ans)',
  confirmed: 'Confirme (2 - 7 ans)',
  senior: 'Senior (7 ans et +)',
}
const typeLabels: Record<string, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  internship: 'Stage / alternance',
}
const contratLabels: Record<string, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  internship: 'Stage / alternance',
}
const modaliteLabels: Record<string, string> = {
  on_site: 'Presentiel',
  hybrid: 'Hybride',
  remote: 'Teletravail',
}

function niveauCorrespond(profile: Profile) {
  const years = profile.experienceYears
  if (niveau.value === 'all') return true
  if (years === null || years === undefined) return false
  if (niveau.value === 'junior') return years <= 2
  if (niveau.value === 'confirmed') return years > 2 && years < 7
  return years >= 7
}

const filteredProfiles = computed(() => profiles.value.filter((profile) => {
  const typeOk = !types.value.length || (profile.employmentType !== null && types.value.includes(profile.employmentType))
  const modeOk = !modalites.value.length || (profile.workMode !== null && modalites.value.includes(profile.workMode))
  return niveauCorrespond(profile) && typeOk && modeOk
}))

const profils = computed<ProfilResume[]>(() => filteredProfiles.value.map((profile) => ({
  nom: profile.firstName + ' ' + profile.lastName,
  intitule: profile.targetSector || 'Candidat disponible',
  ville: profile.location || 'Localisation non renseignee',
  typeContrat: contratLabels[profile.employmentType ?? ''] || 'Contrat a definir',
  modalite: modaliteLabels[profile.workMode ?? ''] || 'Modalite a definir',
  experience: profile.experienceYears !== null && profile.experienceYears !== undefined
    ? Number(profile.experienceYears).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' ans d experience'
    : 'Experience non renseignee',
  competences: [],
  dureeVideo: 'Video disponible',
  certifie: false,
  miniature: heroStudio,
  to: { name: 'recruiter-candidate-profile', params: { id: profile.id } },
})))

const filtresActifs = computed(() => [
  ...(niveau.value !== 'all' ? [niveauLabels[niveau.value]] : []),
  ...types.value.map((value) => typeLabels[value]),
  ...modalites.value.map((value) => modaliteLabels[value]),
])

function retirerFiltre(filtre: string) {
  if (niveauLabels[niveau.value] === filtre) niveau.value = 'all'
  types.value = types.value.filter((value) => typeLabels[value] !== filtre)
  modalites.value = modalites.value.filter((value) => modaliteLabels[value] !== filtre)
}

async function chargerProfils() {
  try {
    profiles.value = await ProfileService.getProfiles()
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger les candidats.'
  } finally {
    loading.value = false
  }
}

onMounted(chargerProfils)
</script>

<template>
  <EnteteCatalogue
    :nombre-candidats="filteredProfiles.length"
    :filtres-actifs="filtresActifs"
    @retirer-filtre="retirerFiltre"
  />

  <div class="flex items-stretch">
    <FiltresCatalogue v-model:niveau="niveau" v-model:types="types" v-model:modalites="modalites" />

    <section class="flex min-w-0 flex-1 flex-col gap-10 p-10">
      <p v-if="loading" class="text-ink-muted">Chargement des candidats...</p>
      <p v-else-if="error" class="text-red-700">{{ error }}</p>
      <p v-else-if="!profils.length" class="text-ink-muted">Aucun candidat ne correspond aux filtres.</p>
      <GrilleCandidats v-else :profils="profils" />

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6">
        <p class="font-heading text-[14px] text-ink-muted">
          Affichage de {{ profils.length }} sur {{ formaterNombre(filteredProfiles.length) }} profils
        </p>
        <Paginator
          v-model:first="premierProfil"
          :rows="6"
          :total-records="filteredProfiles.length"
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>
    </section>
  </div>
</template>
