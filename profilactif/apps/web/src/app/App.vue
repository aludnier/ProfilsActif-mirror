<script setup lang="ts">
import BrandFooter from '@/shared/ui/BrandFooter.vue';
import BrandHeader from '@/shared/ui/BrandHeader.vue';
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <BrandHeader />

    <main class="flex-1">
      <router-view />
    </main>

    <BrandFooter />
  </div>
</template>
