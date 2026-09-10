<script setup lang="ts">
import type { RouteLocationNamedRaw } from 'vue-router';

export type ProfilResume = {
  nom: string;
  intitule: string;
  ville: string;
  modalite: string;
  typeContrat?: string;
  experience: string;
  competences: string[];
  dureeVideo: string;
  certifie: boolean;
  miniature: string;
  // No `to`, no link: there is no public candidate sheet.
  to?: RouteLocationNamedRaw;
  // Overrides the link label when it does not open the sheet (signup teaser).
  libelleLien?: string;
};

defineProps<{ profil: ProfilResume }>();
</script>

<template>
  <article
    class="flex min-w-[280px] flex-1 flex-col overflow-hidden rounded-card border border-surface-line bg-surface-page"
  >
    <div class="relative h-[180px] w-full">
      <img :src="profil.miniature" alt="" class="absolute inset-0 size-full object-cover" />
      <!-- Dark overlay: without it, the badges don't hold up against a light image. -->
      <div class="absolute inset-0 bg-black/25" aria-hidden="true" />

      <div class="absolute inset-x-0 bottom-0 flex items-center justify-between p-3">
        <p
          class="rounded-badge bg-brand px-2 py-1 font-heading text-[12px] font-bold text-on-brand"
        >
          <span class="sr-only">Durée de la vidéo : </span>{{ profil.dureeVideo }}
        </p>
        <p
          v-if="profil.certifie"
          class="rounded-badge bg-status-verified px-2 py-1 font-heading text-[11px] font-bold uppercase text-on-status-verified"
        >
          Vérifié
        </p>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="flex flex-col gap-1">
        <h3 class="text-[16px]">{{ profil.nom }}</h3>
        <p class="font-heading text-[14px] font-medium">{{ profil.intitule }}</p>
        <p class="text-[13px] italic text-ink-muted">
          {{ profil.ville }} • {{ profil.typeContrat ? profil.typeContrat + ' &bull; ' : '' }}
          {{ profil.modalite }} • {{ profil.experience }}
        </p>
      </div>

      <!--
        No fixed height here, unlike the mockup which clips skills past one
        line: a hidden skill is lost information. Cards stay aligned thanks
        to the stretch layout.

        TODO: these hand-rolled badges could be replaced by the PrimeVue Tag
        (or Chip) component instead of recreating the style from scratch —
        cf. the "don't recreate existing PrimeVue components" rule in
        CLAUDE.md.
      -->
      <ul class="flex flex-wrap gap-1.5">
        <li
          v-for="competence in profil.competences"
          :key="competence"
          class="rounded-badge bg-surface-muted px-2 py-[3px] font-heading text-[11px] font-medium text-brand"
        >
          {{ competence }}
        </li>
      </ul>

      <div v-if="profil.to" class="mt-auto flex flex-col gap-4">
        <span class="h-px w-full bg-surface-line" aria-hidden="true" />

        <router-link
          :to="profil.to"
          :aria-label="`${profil.libelleLien ?? 'Visionner le profil'} — ${profil.nom}`"
          class="flex items-center justify-between font-heading text-[13px] font-bold text-action hover:underline"
        >
          {{ profil.libelleLien ?? 'Visionner le profil' }}
          <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.3328 8H12.6672M8 12.6672L12.6672 8L8 3.3328"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </router-link>
      </div>
    </div>
  </article>
</template>
