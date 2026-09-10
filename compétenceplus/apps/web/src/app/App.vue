<script setup lang="ts">
import BandeauDroits from '@/shared/ui/BandeauDroits.vue';
import BrandFooter from '@/shared/ui/BrandFooter.vue';
import BrandHeader from '@/shared/ui/BrandHeader.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <!-- Au-dessus du bloc-marque et collé : visible sur toute capture. -->
    <BandeauDroits />

    <BrandHeader />

    <main class="flex-1">
      <router-view />
    </main>

    <BrandFooter />
  </div>
</template>
