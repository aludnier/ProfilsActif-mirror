<script setup lang="ts">
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import { computed, onMounted, ref } from 'vue';

import heroStudio from '@/assets/images/hero-studio.webp';
import { photoValidee, urlPhotoProfil } from '@/shared/photoProfil';
import ProfileService from '@/services/ProfileService';
import { estCertifie } from '@/shared/certification';
import { formaterNombre } from '@/shared/formatage';
import type { Profile } from '@/shared/types/api';
import { useAuthStore } from '@/shared/stores/auth';
import CarteProfil from '@/shared/ui/CarteProfil.vue';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

const PAR_PAGE = 20;

const authStore = useAuthStore();

/*
 * La fiche exige un compte (`meta.roles` sur `recruiter-candidate-profile`) :
 * proposé à un visiteur, le lien l'enverrait sur la page de connexion. On ne
 * le montre donc qu'à un utilisateur connecté, quel que soit son rôle.
 */
const peutOuvrirUneFiche = computed(() => authStore.user !== null);

const profils = ref<Profile[]>([]);
const chargement = ref(true);
const erreur = ref('');
const premier = ref(0);

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

/* Pagination côté client : l'API renvoie la liste entière, sans page ni limite. */
const page = computed(() => profils.value.slice(premier.value, premier.value + PAR_PAGE));

const resumes = computed<ProfilResume[]>(() =>
  page.value.map((profil) => ({
    nom: `${profil.firstName} ${profil.lastName}`,
    intitule: profil.targetSector || 'Candidat disponible',
    ville: profil.location || 'Localisation non renseignée',
    typeContrat: contratLabels[profil.employmentType ?? ''] || 'Contrat à définir',
    modalite: modaliteLabels[profil.workMode ?? ''] || 'Modalité à définir',
    experience:
      profil.experienceYears !== null && profil.experienceYears !== undefined
        ? `${Number(profil.experienceYears).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans d'expérience`
        : 'Expérience non renseignée',
    competences: [],
    dureeVideo: 'Vidéo de présentation',
    certifie: estCertifie(profil.certificationRate),
    miniature: photoValidee(profil.photoStatus) ? urlPhotoProfil(profil.id) : heroStudio,
    to: peutOuvrirUneFiche.value
      ? { name: 'recruiter-candidate-profile', params: { id: profil.id } }
      : undefined,
  })),
);

onMounted(async () => {
  try {
    profils.value = await ProfileService.getProfiles();
  } catch {
    erreur.value = 'Impossible de charger les profils pour le moment.';
  } finally {
    chargement.value = false;
  }
});
</script>

<template>
  <section class="flex flex-col gap-8 px-4 py-16 sm:px-gutter">
    <div class="flex flex-col gap-2">
      <h1 class="text-[28px]">Profils</h1>
      <p class="text-[15px] text-ink-muted">
        Parcourez les profils page par page. Rien ne se lance tout seul.
      </p>
    </div>

    <p v-if="chargement" class="text-ink-muted">Chargement des profils…</p>
    <Message v-else-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>
    <Message v-else-if="!profils.length" severity="info" :closable="false">
      Aucun profil publié pour le moment.
    </Message>

    <template v-else>
      <ul class="grid list-none grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
        <li v-for="(resume, index) in resumes" :key="page[index].id" class="flex">
          <CarteProfil :profil="resume" />
        </li>
      </ul>

      <!--
        La lecture vidéo à la demande n'est pas branchée ici : toute l'API vidéo
        est derrière `requireAuth` (VideoRoutes.ts), donc un clic renverrait un
        visiteur vers /login. À reprendre quand l'accès aux vidéos sera tranché.
      -->
      <div
        class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6"
      >
        <p class="font-heading text-[14px] text-ink-muted">
          {{ formaterNombre(profils.length) }} profils · {{ PAR_PAGE }} par page
        </p>
        <Paginator
          v-model:first="premier"
          :rows="PAR_PAGE"
          :total-records="profils.length"
          template="PrevPageLink PageLinks NextPageLink"
        />
      </div>
    </template>
  </section>
</template>
