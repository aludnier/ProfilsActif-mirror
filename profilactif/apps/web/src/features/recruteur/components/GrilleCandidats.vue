<script setup lang="ts">
import CarteProfil from '@/shared/ui/CarteProfil.vue';
import type { ProfilResume } from '@/shared/ui/CarteProfil.vue';

defineProps<{ profils: ProfilResume[] }>();
</script>

<template>
  <!--
    Grille 3 colonnes de la maquette, contre une rangée qui s'enroule côté
    landing : même CarteProfil, contexte de mise en page différent.
  -->
  <ul class="grid list-none grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
    <li v-for="profil in profils.slice(0, 20)" :key="profil.nom" class="flex">
        <CarteProfil :profil="profil" />
    </li>
  </ul>
</template>
