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

const TAILLE_PAGE = 20
const profiles = ref<Profile[]>([])
const totalProfils = ref(0)
const pageActuelle = ref(1)
const loading = ref(true)
const error = ref('')
const niveau = ref('all')
const types = ref<string[]>([])
const modalites = ref<string[]>([])
const secteur = ref('')
const localisation = ref('')
const competence = ref('')
const contratDu = ref('')
const contratAu = ref('')
const certification = ref('')

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
const contratLabels = typeLabels
const modaliteLabels: Record<string, string> = {
  on_site: 'Presentiel',
  hybrid: 'Hybride',
  remote: 'Teletravail',
}

const profils = computed<ProfilResume[]>(() => profiles.value.map((profile) => ({
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
  ...(certification.value === 'certifiee' ? ['Certifiée'] : []),
  ...(certification.value === 'non_certifiee' ? ['Non certifiée'] : []),
  ...(contratDu.value ? ['Contrat du : ' + contratDu.value] : []),
  ...(contratAu.value ? ['Contrat au : ' + contratAu.value] : []),
])

async function chargerProfils(page = 1) {
  loading.value = true
  error.value = ''
  try {
    const result = await ProfileService.getProfilesPage({
      page,
      limit: TAILLE_PAGE,
      niveau: niveau.value,
      types: types.value,
      modalites: modalites.value,
      secteur: secteur.value.trim(),
      localisation: localisation.value.trim(),
      competence: competence.value.trim(),
      contratDu: contratDu.value,
      contratAu: contratAu.value,
      certification: certification.value,
    })
    profiles.value = result.data
    pageActuelle.value = result.page
    totalProfils.value = result.total
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger les candidats.'
  } finally {
    loading.value = false
  }
}

function retirerFiltre(filtre: string) {
  if (niveauLabels[niveau.value] === filtre) niveau.value = 'all'
  types.value = types.value.filter((value) => typeLabels[value] !== filtre)
  modalites.value = modalites.value.filter((value) => modaliteLabels[value] !== filtre)
  if (filtre === 'Compétence : ' + competence.value.trim()) competence.value = ''
  if (filtre === 'Secteur : ' + secteur.value.trim()) secteur.value = ''
  if (filtre === 'Localisation : ' + localisation.value.trim()) localisation.value = ''
  if (filtre === 'Certifiée' || filtre === 'Non certifiée') certification.value = ''
  if (filtre === 'Contrat du : ' + contratDu.value) contratDu.value = ''
  if (filtre === 'Contrat au : ' + contratAu.value) contratAu.value = ''
}

function changerPage(event: { page: number }) {
  void chargerProfils(event.page + 1)
}

watch([niveau, types, modalites, secteur, localisation, competence, contratDu, contratAu, certification], () => {
  if (!loading.value) void chargerProfils(1)
})

onMounted(() => void chargerProfils())
</script>

<template>
  <EnteteCatalogue
    :nombre-candidats="totalProfils"
    :filtres-actifs="filtresActifs"
    @retirer-filtre="retirerFiltre"
  />

  <div class="flex items-stretch">
    <FiltresCatalogue v-model:niveau="niveau" v-model:types="types" v-model:modalites="modalites" v-model:secteur="secteur" v-model:localisation="localisation" v-model:competence="competence" v-model:contrat-du="contratDu" v-model:contrat-au="contratAu" v-model:certification="certification" />

    <section class="flex min-w-0 flex-1 flex-col gap-10 p-10">
      <p v-if="loading" class="text-ink-muted">Chargement des candidats...</p>
      <p v-else-if="error" class="text-red-700">{{ error }}</p>
      <p v-else-if="!profils.length" class="text-ink-muted">Aucun candidat ne correspond aux filtres.</p>
      <GrilleCandidats v-else :profils="profils" :premier-vue="0" />

      <div class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6">
        <p class="font-heading text-[14px] text-ink-muted">
          Affichage de {{ profiles.length }} sur {{ formaterNombre(totalProfils) }} profils
        </p>
        <Paginator
          :first="(pageActuelle - 1) * TAILLE_PAGE"
          :rows="TAILLE_PAGE"
          :total-records="totalProfils"
          template="PrevPageLink PageLinks NextPageLink"
          @page="changerPage"
        />
      </div>
    </section>
  </div>
</template>
