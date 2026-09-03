<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '@/shared/stores/auth';

const router = useRouter();
const { deconnecter } = useAuth();

/* A route rather than a button, so the header only has to link here. */
onMounted(() => {
  deconnecter();
  router.replace({ name: 'home' });
});
</script>

<template>
  <p class="px-4 py-16 text-center text-[15px] text-ink-muted sm:px-gutter">Déconnexion…</p>
</template>
