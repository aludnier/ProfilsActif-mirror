<script setup lang="ts">
import aurelieMasson from '@/assets/images/profils/aurelie-masson.webp';
import claraMorisset from '@/assets/images/profils/clara-morisset.webp';
import olivierGiraud from '@/assets/images/profils/olivier-giraud.webp';
import sebastienChevalier from '@/assets/images/profils/sebastien-chevalier.webp';
import thierryHenry from '@/assets/images/profils/thierry-henry.webp';
import yasminaBensaid from '@/assets/images/profils/yasmina-bensaid.webp';
import Paginator from 'primevue/paginator';
import { ref } from 'vue';

import EnteteCatalogue from '@/features/recruteur/components/EnteteCatalogue.vue';
import FiltresCatalogue from '@/features/recruteur/components/FiltresCatalogue.vue';
import GrilleCandidats from '@/features/recruteur/components/GrilleCandidats.vue';
import { formaterNombre } from '@/shared/formatage';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

/*
 * Hardcoded profiles for now, before fetching them from the API. To be
 * replaced by `GET /api/profils` with its filters (the query lives in
 * ProfilRepository on the API side, cf. docs/README.md: the catalog does not
 * reimplement the feed's filtering). View state stays in the view — no store
 * for this.
 */
const profils: ProfilResume[] = [
  {
    nom: 'Thierry Henry',
    intitule: 'Administrateur de systèmes Linux',
    ville: 'Strasbourg (67)',
    modalite: 'Hybride',
    experience: "6 ans d'expérience",
    competences: ['Debian/RHEL', 'Ansible', 'Docker', 'Security'],
    dureeVideo: '1:10',
    certifie: true,
    miniature: thierryHenry,
    to: { name: 'candidate-profile', params: { id: '5' } },
  },
  {
    nom: 'Clara Morisset',
    intitule: 'Consultante en transition énergétique',
    ville: 'Bordeaux (33)',
    modalite: 'Déplacements',
    experience: "4 ans d'expérience",
    competences: ['Bilan carbone', 'RSE', 'Réglementation public'],
    dureeVideo: '1:45',
    certifie: true,
    miniature: claraMorisset,
    to: { name: 'candidate-profile', params: { id: '6' } },
  },
  {
    nom: 'Sébastien Chevalier',
    intitule: 'Directeur des ventes équipements',
    ville: 'Marseille (13)',
    modalite: 'Présentiel',
    experience: "12 ans d'expérience",
    competences: ['Négociation B2B', 'Management', 'Export'],
    dureeVideo: '1:55',
    certifie: true,
    miniature: sebastienChevalier,
    to: { name: 'candidate-profile', params: { id: '7' } },
  },
  {
    nom: 'Yasmina Bensaid',
    intitule: 'Développeuse front-end React/UI',
    ville: 'Toulouse (31)',
    modalite: 'Télétravail',
    experience: "3 ans d'expérience",
    competences: ['React', 'TypeScript', 'Tailwind CSS', 'WCAG'],
    dureeVideo: '1:05',
    certifie: true,
    miniature: yasminaBensaid,
    to: { name: 'candidate-profile', params: { id: '8' } },
  },
  {
    nom: 'Olivier Giraud',
    intitule: 'Comptable public adjoint',
    ville: 'Orléans (45)',
    modalite: 'Présentiel',
    experience: "7 ans d'expérience",
    competences: ['Comptabilité publique', 'M57', 'Excel expert'],
    dureeVideo: '1:20',
    certifie: true,
    miniature: olivierGiraud,
    to: { name: 'candidate-profile', params: { id: '9' } },
  },
  {
    nom: 'Aurélie Masson',
    intitule: 'Ergothérapeute conseil',
    ville: 'Montpellier (34)',
    modalite: 'Cabinet',
    experience: "5 ans d'expérience",
    competences: ['Ergonomie', 'Adaptation habitat', 'Pédagogie'],
    dureeVideo: '1:30',
    certifie: true,
    miniature: aurelieMasson,
    to: { name: 'candidate-profile', params: { id: '10' } },
  },
];

/*
 * Active filters live in the view, not in a store. TODO: implement Pinia to
 * move this into a store. Eventually they'll also move into the query
 * string (shareable, reloadable), per docs/README.md — that's when they'll
 * actually filter the list. Removing one today doesn't change the results,
 * since there's no request behind it yet.
 */
const filtresActifs = ref(['Temps plein', 'Hybride', 'Expérience > 5 ans']);

function retirerFiltre(filtre: string): void {
  filtresActifs.value = filtresActifs.value.filter((actif) => actif !== filtre);
}

const niveau = ref('Tous niveaux');
const dureesVideo = ref<string[]>([]);

/*
 * TODO: wire up real pagination against `GET /api/profils`. The six
 * profiles above represent the first page of a catalog that has 1,284
 * entries in the mockup. The Paginator is real and navigable, but changing
 * page won't reload anything until `GET /api/profils` exists — the paginated
 * API query will supply the following pages.
 */
const TOTAL_PROFILS = 1284;
const PROFILS_PAR_PAGE = 6;
const premierProfil = ref(0);
</script>

<template>
  <EnteteCatalogue
    :nombre-candidats="TOTAL_PROFILS"
    :filtres-actifs="filtresActifs"
    @retirer-filtre="retirerFiltre"
  />

  <div class="flex items-stretch">
    <FiltresCatalogue v-model:niveau="niveau" v-model:durees="dureesVideo" />

    <section class="flex min-w-0 flex-1 flex-col gap-10 p-10">
      <GrilleCandidats :profils="profils" />

      <div
        class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6"
      >
        <p class="font-heading text-[14px] text-ink-muted">
          Affichage de {{ profils.length }} sur {{ formaterNombre(TOTAL_PROFILS) }} profils
        </p>

        <Paginator
          v-model:first="premierProfil"
          :rows="PROFILS_PAR_PAGE"
          :total-records="TOTAL_PROFILS"
          template="PrevPageLink PageLinks NextPageLink"
          :dt="{
            background: 'transparent',
            padding: '0',
            // The mockup fills the current page with solid blue, which the brand
            // rules forbid as a button background. Reusing the light-pill-with-
            // blue-text pattern used for this case elsewhere.
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
