<script setup lang="ts">
import Message from 'primevue/message';
</script>

<template>
  <section class="flex flex-col gap-6 px-4 py-16 sm:px-gutter">
    <div class="flex flex-col gap-2">
      <h1 class="text-[28px]">Feeds</h1>
      <p class="text-[15px] text-ink-muted">
        Le fil des vidéos de présentation, à faire défiler une par une.
      </p>
    </div>

    <Message severity="info" :closable="false"> Cette page n’est pas encore construite. </Message>
  </section>
</template>
