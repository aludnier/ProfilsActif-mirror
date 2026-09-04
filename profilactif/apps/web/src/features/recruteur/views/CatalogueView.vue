<script setup lang="ts">
import Paginator from 'primevue/paginator';
import { computed, onMounted, ref } from 'vue';

import ProfileService from '@/services/ProfileService';
import heroStudio from '@/assets/images/hero-studio.webp';

import EnteteCatalogue from '@/features/recruteur/components/EnteteCatalogue.vue';
import FiltresCatalogue from '@/features/recruteur/components/FiltresCatalogue.vue';
import GrilleCandidats from '@/features/recruteur/components/GrilleCandidats.vue';
import { formaterNombre } from '@/shared/formatage';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

const profils = ref<ProfilResume[]>([])
const loading = ref(true)
const error = ref('')

async function chargerProfils() {
  try {
    const profiles = await ProfileService.getProfiles()
    profils.value = profiles.map((profile) => ({
      nom: profile.firstName + ' ' + profile.lastName,
      intitule: profile.targetSector || 'Candidat disponible',
      ville: profile.location || 'Localisation non renseignee',
      modalite: 'A definir',
      experience: profile.age ? profile.age + ' ans' : 'Profil actif',
      competences: [],
      dureeVideo: 'Video disponible',
      certifie: false,
      miniature: heroStudio,
      to: { name: 'recruiter-candidate-profile', params: { id: profile.id } },
    }))
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger les candidats.'
  } finally {
    loading.value = false
  }
}

const totalProfils = computed(() => profils.value.length)
onMounted(chargerProfils)

const filtresActifs = ref(['Temps plein', 'Hybride', 'Expérience > 5 ans']);

function retirerFiltre(filtre: string): void {
  filtresActifs.value = filtresActifs.value.filter((actif) => actif !== filtre);
}

const niveau = ref('Tous niveaux');
const dureesVideo = ref<string[]>([]);

const PROFILS_PAR_PAGE = 6;
const premierProfil = ref(0);
</script>

<template>
  <EnteteCatalogue
    :nombre-candidats="totalProfils"
    :filtres-actifs="filtresActifs"
    @retirer-filtre="retirerFiltre"
  />

  <div class="flex items-stretch">
    <FiltresCatalogue v-model:niveau="niveau" v-model:durees="dureesVideo" />

    <section class="flex min-w-0 flex-1 flex-col gap-10 p-10">
      <p v-if="loading" class="text-ink-muted">Chargement des candidats...</p>
      <p v-else-if="error" class="text-red-700">{{ error }}</p>
      <p v-else-if="!profils.length" class="text-ink-muted">Aucun candidat actif pour le moment.</p>
      <GrilleCandidats v-else :profils="profils" />

      <div
        class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6"
      >
        <p class="font-heading text-[14px] text-ink-muted">
          Affichage de {{ profils.length }} sur {{ formaterNombre(totalProfils) }} profils
        </p>

        <Paginator
          v-model:first="premierProfil"
          :rows="PROFILS_PAR_PAGE"
          :total-records="totalProfils"
          template="PrevPageLink PageLinks NextPageLink"
          :dt="{
            background: 'transparent',
            padding: '0',
            navButton: {
              selectedBackground: 'var(--color-brand-50)',
              selectedColor: 'var(--color-brand)',
            },
          }"
        />
      </div>
    </section>
  </div>
</template>
