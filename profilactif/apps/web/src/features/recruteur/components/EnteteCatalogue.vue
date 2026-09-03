<script setup lang="ts">
import { formaterNombre } from '@/shared/formatage';

defineProps<{
  nombreCandidats: number;
  filtresActifs: string[];
}>();

defineEmits<{ retirerFiltre: [filtre: string] }>();
</script>

<template>
  <div class="flex flex-col items-start gap-6 border-b border-surface-line px-gutter py-8">
    <div class="flex w-full flex-wrap items-center justify-between gap-4">
      <div class="flex flex-col items-start gap-1">
        <h1 class="text-[28px]">Annuaire des profils vidéos</h1>
        <p class="text-[15px] text-ink-muted">
          Accès éthique et souverain aux compétences du territoire national
        </p>
      </div>

      <!-- La maquette écrit « 1,284 » à l'anglaise, alors que sa propre
           pagination affiche « 1 284 ». On formate à la française. -->
      <p
        class="rounded-badge bg-surface-muted px-3 py-1.5 font-heading text-[13px] font-bold uppercase text-brand"
      >
        {{ formaterNombre(nombreCandidats) }} candidats actifs
      </p>
    </div>

    <ul v-if="filtresActifs.length" class="flex flex-wrap items-start gap-2">
      <li
        v-for="filtre in filtresActifs"
        :key="filtre"
        class="flex items-center gap-1.5 rounded-full border border-brand bg-surface-muted px-3 py-2.5 font-heading text-[13px] font-medium text-brand"
      >
        {{ filtre }}
        <button
          type="button"
          :aria-label="`Retirer le filtre : ${filtre}`"
          class="flex cursor-pointer items-center"
          @click="$emit('retirerFiltre', filtre)"
        >
          <!-- Tracé repris de l'export Figma, dont le `stroke` figeait le bleu
               de marque hors des tokens. -->
          <svg class="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M7.50012 4.49988L4.49988 7.50012M4.49988 4.49988L7.50012 7.50012M11.0004 6C11.0004 8.76164 8.76164 11.0004 6 11.0004C3.23836 11.0004 0.9996 8.76164 0.9996 6C0.9996 3.23836 3.23836 0.9996 6 0.9996C8.76164 0.9996 11.0004 3.23836 11.0004 6Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
