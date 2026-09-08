<script setup lang="ts">
import Paginator from 'primevue/paginator'
import { computed, onMounted, ref, watch } from 'vue'

import ProfileService from '@/services/ProfileService'
import heroStudio from '@/assets/images/hero-studio.webp'
import EnteteCatalogue from '@/features/recruteur/components/EnteteCatalogue.vue'
import FiltresCatalogue from '@/features/recruteur/components/FiltresCatalogue.vue'
import GrilleCandidats from '@/features/recruteur/components/GrilleCandidats.vue'
import { formaterNombre } from '@/shared/formatage'
import { estCertifie } from '@/shared/certification'
import type { Profile } from '@/shared/types/api'
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue'

const profiles = ref<Profile[]>([])
const loading = ref(true)
const error = ref('')
const niveau = ref('all')
const types = ref<string[]>([])
const modalites = ref<string[]>([])
const secteur = ref('')
const localisation = ref('')
const competence = ref('')
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

const filteredProfiles = computed(() => {
  const normalizedSecteur = secteur.value.trim().toLowerCase()
  const normalizedLocalisation = localisation.value.trim().toLowerCase()
  const normalizedCompetence = competence.value.trim().toLowerCase()

  return profiles.value.filter((profile) => {
    const typeOk = !types.value.length || (profile.employmentType !== null && types.value.includes(profile.employmentType))
    const modeOk = !modalites.value.length || (profile.workMode !== null && modalites.value.includes(profile.workMode))
    const secteurOk = !normalizedSecteur || (profile.targetSector ?? '').toLowerCase().includes(normalizedSecteur)
    const localisationOk = !normalizedLocalisation || (profile.location ?? '').toLowerCase().includes(normalizedLocalisation)
    const competenceOk = !normalizedCompetence || (profile.competences ?? []).some((value) => value.toLowerCase().includes(normalizedCompetence))
    return niveauCorrespond(profile) && typeOk && modeOk && secteurOk && localisationOk && competenceOk
  })
})

const profils = computed<ProfilResume[]>(() => filteredProfiles.value.map((profile) => ({
  nom: profile.firstName + ' ' + profile.lastName,
  intitule: profile.targetSector || 'Candidat disponible',
  ville: profile.location || 'Localisation non renseignee',
  typeContrat: contratLabels[profile.employmentType ?? ''] || 'Contrat a definir',
  modalite: modaliteLabels[profile.workMode ?? ''] || 'Modalite a definir',
  experience: profile.experienceYears !== null && profile.experienceYears !== undefined
    ? Number(profile.experienceYears).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' ans d experience'
    : 'Experience non renseignee',
  competences: profile.competences ?? [],
  dureeVideo: 'Video disponible',
  certifie: estCertifie(profile.certificationRate),
  miniature: heroStudio,
  to: { name: 'recruiter-candidate-profile', params: { id: profile.id } },
})))

const filtresActifs = computed(() => [
  ...(niveau.value !== 'all' ? [niveauLabels[niveau.value]] : []),
  ...types.value.map((value) => typeLabels[value]),
  ...modalites.value.map((value) => modaliteLabels[value]),
  ...(competence.value.trim() ? ['Compétence : ' + competence.value.trim()] : []),
  ...(secteur.value.trim() ? ['Secteur : ' + secteur.value.trim()] : []),
  ...(localisation.value.trim() ? ['Localisation : ' + localisation.value.trim()] : []),
])

watch([niveau, types, modalites, secteur, localisation, competence], () => {
  premierProfil.value = 0
})

function retirerFiltre(filtre: string) {
  if (niveauLabels[niveau.value] === filtre) niveau.value = 'all'
  types.value = types.value.filter((value) => typeLabels[value] !== filtre)
  modalites.value = modalites.value.filter((value) => modaliteLabels[value] !== filtre)
  if (filtre === 'Compétence : ' + competence.value.trim()) competence.value = ''
  if (filtre === 'Secteur : ' + secteur.value.trim()) secteur.value = ''
  if (filtre === 'Localisation : ' + localisation.value.trim()) localisation.value = ''
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
    <FiltresCatalogue v-model:niveau="niveau" v-model:types="types" v-model:modalites="modalites" v-model:secteur="secteur" v-model:localisation="localisation" v-model:competence="competence" />

    <section class="flex min-w-0 flex-1 flex-col gap-10 p-10">
      <p v-if="loading" class="text-ink-muted">Chargement des candidats...</p>
      <p v-else-if="error" class="text-red-700">{{ error }}</p>
      <p v-else-if="!profils.length" class="text-ink-muted">Aucun candidat ne correspond aux filtres.</p>
      <GrilleCandidats v-else :profils="profils" :premier-vue="premierProfil" />

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6">
        <p class="font-heading text-[14px] text-ink-muted">
          Affichage de {{ filteredProfiles.length - premierProfil > 20 ? 20 : (filteredProfiles.length - premierProfil)}} sur {{ formaterNombre(filteredProfiles.length) }} profils
        </p>
        <Paginator
          v-model:first="premierProfil"
          :rows="20"
          :total-records="filteredProfiles.length"
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>
    </section>
  </div>
</template>
