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
 * Profils figés issus de la maquette, en attendant `GET /api/profils` avec
 * ses filtres (la requête vit dans ProfilRepository côté API, cf.
 * docs/README.md : le catalogue ne réimplémente pas le filtrage du feed).
 * L'état de la vue reste dans la vue — pas de store pour ça.
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
 * Les filtres actifs vivent dans la vue, pas dans un store. À terme ils
 * passeront dans la query string (partageable, rechargeable), conformément à
 * docs/README.md — et c'est à ce moment-là qu'ils filtreront réellement la
 * liste. Aujourd'hui les retirer ne change pas les résultats, faute de
 * requête derrière.
 */
const filtresActifs = ref(['Temps plein', 'Hybride', 'Expérience > 5 ans']);

function retirerFiltre(filtre: string): void {
  filtresActifs.value = filtresActifs.value.filter((actif) => actif !== filtre);
}

const niveau = ref('Tous niveaux');
const dureesVideo = ref<string[]>([]);

/*
 * Les six profils ci-dessus représentent la première page d'un catalogue qui
 * en compte 1 284 dans la maquette. Le Paginator est donc réel et navigable,
 * mais changer de page ne rechargera rien tant que `GET /api/profils` n'existe
 * pas : c'est la requête paginée côté API qui fournira les pages suivantes.
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
            // La maquette met la page courante en bleu plein, ce que les règles
            // de marque interdisent en fond de bouton. On reprend le motif
            // « pastille à fond clair + texte bleu » prévu pour ce cas.
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
