<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import ProfileService from '@/services/ProfileService';
import { estCertifie } from '@/shared/certification';
import { formaterNombre } from '@/shared/formatage';
import type { Profile } from '@/shared/types/api';

const profils = ref<Profile[]>([]);

/*
 * Figures come from the public profile list, not from /admin/stats: that route
 * is admin-only and the landing page is anonymous. Same underlying rows, minus
 * the candidates who hid themselves from the catalogue.
 */
const mesures = computed(() => {
  const total = profils.value.length;
  if (total === 0) return null;

  const certifies = profils.value.filter((profil) => estCertifie(profil.certificationRate)).length;
  const moyenne = Math.round(
    profils.value.reduce((somme, profil) => somme + Number(profil.certificationRate), 0) / total,
  );

  return { total, certifies, moyenne };
});

// Keywords until the figures arrive: the strip never shows a zero or a blank.
const REPLI = [
  { cle: 'Vidéo', libelle: 'Se présenter en deux minutes' },
  { cle: 'Certification', libelle: 'Un questionnaire commun à tous' },
  { cle: 'Déontologie', libelle: 'Charte anti-discrimination' },
];

const piliers = computed(() => {
  const m = mesures.value;
  if (m === null) return REPLI;

  // Short labels: the mockup sets them in 14px uppercase, on one line.
  return [
    { cle: formaterNombre(m.total), libelle: 'Profils vidéo publiés' },
    { cle: formaterNombre(m.certifies), libelle: 'Candidats certifiés' },
    { cle: `${m.moyenne} %`, libelle: 'Taux moyen de certification' },
  ];
});

onMounted(async () => {
  profils.value = await ProfileService.getProfiles().catch(() => []);
});
</script>

<template>
  <!-- Sizes taken from the mockup (Screen_1, node 1103:2439). -->
  <section class="bg-brand px-gutter py-10">
    <ul class="flex list-none flex-wrap items-start justify-between gap-8">
      <li v-for="pilier in piliers" :key="pilier.cle" class="flex flex-col items-center gap-1">
        <p class="font-heading text-[36px] font-bold leading-none text-on-brand">
          {{ pilier.cle }}
        </p>
        <p class="text-center text-[14px] uppercase text-ink-invert">
          {{ pilier.libelle }}
        </p>
      </li>
    </ul>
  </section>
</template>
