<script setup lang="ts">
import Button from 'primevue/button';

/*
 * Reusable error page. Defaults to a 404 so the router's catch-all route can
 * render it directly, but any code can be passed (403, 500…).
 */
withDefaults(
  defineProps<{
    code?: string;
    titre?: string;
    message?: string;
  }>(),
  {
    code: '404',
    titre: 'Cette page n’existe pas',
    message:
      'L’adresse demandée est introuvable. Elle a peut-être été déplacée, ou le lien que vous avez suivi est incorrect.',
  },
);
</script>

<template>
  <section class="flex flex-col items-center gap-6 px-4 py-24 text-center sm:px-gutter">
    <p class="font-heading text-[64px] font-bold leading-none text-brand">{{ code }}</p>

    <div class="flex max-w-140 flex-col gap-3">
      <h1 class="text-[24px]">{{ titre }}</h1>
      <p class="text-[15px] leading-[1.7] text-ink-muted">{{ message }}</p>
    </div>

    <!-- Extra actions go in the slot; the way home is always there. -->
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button
        as="router-link"
        :to="{ name: 'home' }"
        label="Retour à l’accueil"
        class="rounded-control px-6 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
      />
      <slot />
    </div>
  </section>
</template>
