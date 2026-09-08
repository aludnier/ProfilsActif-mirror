<script setup lang="ts">
import { useRoute } from 'vue-router';

const liens = [
  { libelle: 'Tableau de bord', to: 'admin-stats' },
  { libelle: 'Utilisateurs & modération', to: 'admin-dashboard' },
  { libelle: 'Validation vidéo', to: 'admin-videos' },
  { libelle: 'Questionnaire', to: 'admin-questions' },
];

const route = useRoute();
</script>

<template>
  <nav class="flex flex-wrap gap-2 border-b border-surface-line pb-4">
    <router-link
      v-for="lien in liens"
      :key="lien.to"
      :to="{ name: lien.to }"
      class="rounded-control px-4 py-2 font-heading text-[13px] font-medium"
      :class="
        route.name === lien.to
          ? 'bg-brand text-on-brand'
          : 'border border-surface-line bg-surface-page text-ink hover:bg-surface-subtle'
      "
    >
      {{ lien.libelle }}
    </router-link>
  </nav>
</template>
