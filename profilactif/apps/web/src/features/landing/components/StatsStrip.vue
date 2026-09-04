<script setup lang="ts">
/*
 * Keywords rather than figures: the numbers here were invented, and a public
 * service can't advertise results it hasn't measured. Each pillar states
 * something the product actually does.
 */
const piliers = [
  {
    motCle: 'Vidéo',
    description: 'Deux minutes pour se présenter, au-delà du CV papier.',
  },
  {
    motCle: 'Certification',
    description: 'Des compétences évaluées par un questionnaire commun à tous.',
  },
  {
    motCle: 'Déontologie',
    description: 'Une charte anti-discrimination acceptée par chaque recruteur.',
  },
];
</script>

<template>
  <section class="bg-brand px-gutter py-10">
    <ul class="grid gap-8 sm:grid-cols-3">
      <li v-for="pilier in piliers" :key="pilier.motCle" class="flex flex-col gap-2">
        <p class="font-heading text-[22px] font-bold uppercase tracking-[0.5px] text-on-brand">
          {{ pilier.motCle }}
        </p>
        <p class="text-[15px] leading-[1.6] text-ink-invert">
          {{ pilier.description }}
        </p>
      </li>
    </ul>
  </section>
</template>
