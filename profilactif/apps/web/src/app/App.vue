<script setup lang="ts">
import BrandFooter from '@/shared/ui/BrandFooter.vue';
import BrandHeader from '@/shared/ui/BrandHeader.vue';
</script>

<template>
  <!-- `flex-1` sur <main> garde le pied de page en bas sur les pages courtes. -->
  <div class="flex min-h-screen flex-col">
    <BrandHeader />

    <main class="flex-1">
      <router-view />
    </main>

    <BrandFooter />
  </div>
</template>
