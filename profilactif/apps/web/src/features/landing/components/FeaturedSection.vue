<script setup lang="ts">
import ameliedubois from '@/assets/images/profils/amelie-dubois.webp';
import faridamansour from '@/assets/images/profils/farida-mansour.webp';
import jeanmarclemoine from '@/assets/images/profils/jean-marc-lemoine.webp';
import thibaultsoyer from '@/assets/images/profils/thibault-soyer.webp';
import CarteProfil from '@/shared/ui/CarteProfil.vue';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

/*
 * Profils figés issus de la maquette, en attendant `GET /api/profils`
 * (slice profil). Cette liste deviendra une prop, ou un appel à
 * features/profil/api.ts une fois l'API disponible.
 */
const profils: ProfilResume[] = [
  {
    nom: 'Amélie Dubois',
    intitule: 'Chef de projet logistique',
    ville: 'Nantes (44)',
    modalite: 'Hybride',
    experience: "5 ans d'expérience",
    competences: ['Chaîne logistique', 'Agile', 'SAP', 'RSE'],
    dureeVideo: '1:30',
    certifie: true,
    miniature: ameliedubois,
    to: { name: 'candidate-profile', params: { id: '1' } },
  },
  {
    nom: 'Jean-Marc Lemoine',
    intitule: 'Développeur back-end Java',
    ville: 'Lyon (69)',
    modalite: 'Télétravail',
    experience: "8 ans d'expérience",
    competences: ['Java/Spring', 'Kubernetes', 'PostgreSQL'],
    dureeVideo: '1:15',
    certifie: true,
    miniature: jeanmarclemoine,
    to: { name: 'candidate-profile', params: { id: '2' } },
  },
  {
    nom: 'Farida Mansour',
    intitule: 'Chargée de clientèle banque',
    ville: 'Paris (75)',
    modalite: 'Présentiel',
    experience: "3 ans d'expérience",
    competences: ['Gestion de portefeuille', 'Assurances', 'Négociation'],
    dureeVideo: '1:24',
    certifie: true,
    miniature: faridamansour,
    to: { name: 'candidate-profile', params: { id: '3' } },
  },
  {
    nom: 'Thibault Soyer',
    intitule: 'Technicien maintenance industrielle',
    ville: 'Lille (59)',
    modalite: 'Déplacements',
    experience: "2 ans d'expérience",
    competences: ['Automates', 'Câblage', 'Sécurité', 'Électricité'],
    dureeVideo: '1:40',
    certifie: true,
    miniature: thibaultsoyer,
    to: { name: 'candidate-profile', params: { id: '4' } },
  },
];
</script>

<template>
  <section aria-labelledby="talents-en-avant" class="bg-surface-subtle px-gutter py-22">
    <div class="flex flex-col gap-10">
      <div class="flex flex-col gap-2">
        <p class="font-heading text-[12px] font-bold uppercase text-action">
          Dernières publications
        </p>
        <h2 id="talents-en-avant" class="text-[32px]">Talents mis en avant cette semaine</h2>
      </div>

      <!--
        Les flèches de carrousel de la maquette ne sont pas reprises : avec
        quatre profils tous affichés, elles ne piloteraient rien. Le jour où
        l'API en renvoie davantage, cette grille devient un <Carousel> PrimeVue
        (numVisible=4), qui fournit ses propres boutons accessibles — plutôt
        que des chevrons maison sans effet.
      -->
      <ul class="flex list-none flex-wrap gap-6">
        <li v-for="profil in profils" :key="profil.nom" class="flex min-w-[280px] flex-1">
          <CarteProfil :profil="profil" />
        </li>
      </ul>
    </div>
  </section>
</template>
