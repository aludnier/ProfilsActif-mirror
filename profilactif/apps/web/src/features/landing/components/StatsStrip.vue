<script setup lang="ts">
/*
 * It's number for illustrating before the API is set up.
 * 
 * 
 */
const statistiques = [
  { valeur: '45 000 +', libelle: 'Profils vidéos validés' },
  { valeur: '94 %', libelle: 'Taux de retour recruteurs' },
  { valeur: '20 min', libelle: 'Gain de temps moyen au triage' },
];
</script>

<template>
  <section class="bg-brand px-gutter py-10">
    <ul class="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
      <li
        v-for="statistique in statistiques"
        :key="statistique.libelle"
        class="flex flex-col items-center gap-1"
      >
        <p class="whitespace-nowrap font-heading text-[36px] font-bold text-on-brand">
          {{ statistique.valeur }}
        </p>
        <p class="font-heading text-[14px] uppercase text-ink-invert">
          {{ statistique.libelle }}
        </p>
      </li>
    </ul>
  </section>
</template>
