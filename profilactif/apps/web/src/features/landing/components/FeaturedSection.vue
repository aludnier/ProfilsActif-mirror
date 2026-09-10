<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import heroStudio from '@/assets/images/hero-studio.webp';
import ProfileService from '@/services/ProfileService';
import { estCertifie } from '@/shared/certification';
import { photoValidee, urlPhotoProfil } from '@/shared/photoProfil';
import { useAuthStore } from '@/shared/stores/auth';
import type { Profile } from '@/shared/types/api';
import CarteProfil from '@/shared/ui/CarteProfil.vue';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

const NOMBRE_CARTES = 4;

const authStore = useAuthStore();
const profils = ref<Profile[]>([]);

const modaliteLabels: Record<string, string> = {
  on_site: 'Présentiel',
  hybrid: 'Hybride',
  remote: 'Télétravail',
};
const contratLabels: Record<string, string> = {
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  freelance: 'Freelance',
  internship: 'Stage / alternance',
};

// The candidate sheet needs an account.
const peutOuvrirUneFiche = computed(() => authStore.user !== null);

// This section showcases: certified first, then best score.
const selection = computed(() =>
  [...profils.value]
    .sort(
      (a, b) =>
        Number(estCertifie(b.certificationRate)) - Number(estCertifie(a.certificationRate)) ||
        b.certificationRate - a.certificationRate,
    )
    .slice(0, NOMBRE_CARTES),
);

const resumes = computed<ProfilResume[]>(() =>
  selection.value.map((profil) => ({
    nom: `${profil.firstName} ${profil.lastName}`,
    intitule: profil.targetSector || 'Candidat disponible',
    ville: profil.location || 'Localisation non renseignée',
    typeContrat: contratLabels[profil.employmentType ?? ''] || 'Contrat à définir',
    modalite: modaliteLabels[profil.workMode ?? ''] || 'Modalité à définir',
    experience:
      profil.experienceYears !== null && profil.experienceYears !== undefined
        ? `${Number(profil.experienceYears).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans d'expérience`
        : 'Expérience non renseignée',
    // The public list carries no skills; only the catalogue query does.
    competences: [],
    dureeVideo: 'Vidéo de présentation',
    certifie: estCertifie(profil.certificationRate),
    miniature: photoValidee(profil.photoStatus) ? urlPhotoProfil(profil.id) : heroStudio,
    // A visitor cannot open a sheet: the card invites them to sign up instead.
    to: peutOuvrirUneFiche.value
      ? { name: 'recruiter-candidate-profile', params: { id: profil.id } }
      : { name: 'signup' },
    libelleLien: peutOuvrirUneFiche.value ? undefined : 'Créer un compte pour voir ce profil',
  })),
);

onMounted(async () => {
  // Landing page: on failure the section disappears rather than showing an error.
  profils.value = await ProfileService.getProfiles().catch(() => []);
});
</script>

<template>
  <!-- Nothing to showcase yet: hide the whole block. -->
  <section
    v-if="resumes.length"
    aria-labelledby="talents-en-avant"
    class="bg-surface-subtle px-gutter py-22"
  >
    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-2">
        <p class="font-heading text-[12px] font-bold uppercase text-action">
          Dernières publications
        </p>
        <h2 id="talents-en-avant" class="text-[32px]">Talents mis en avant cette semaine</h2>
      </div>

      <ul class="flex list-none flex-wrap gap-6">
        <li v-for="profil in resumes" :key="profil.nom" class="flex min-w-[280px] flex-1">
          <CarteProfil :profil="profil" />
        </li>
      </ul>
    </div>
  </section>
</template>
