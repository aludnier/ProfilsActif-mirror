<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.logout()
  router.replace({ name: 'home' })
})
</script>

<template>
  <p class="px-4 py-16 text-center text-[15px] text-ink-muted sm:px-gutter">Déconnexion…</p>
</template>
