<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  level: string | null
}>()

const STYLES: Record<string, { libelle: string; classe: string }> = {
  senior: { libelle: 'Certifié senior', classe: 'bg-amber-100 text-amber-800 ring-amber-300' },
  or: { libelle: 'Certifié senior', classe: 'bg-amber-100 text-amber-800 ring-amber-300' },
  intermédiaire: { libelle: 'Certifié intermédiaire', classe: 'bg-slate-100 text-slate-700 ring-slate-300' },
  intermediaire: { libelle: 'Certifié intermédiaire', classe: 'bg-slate-100 text-slate-700 ring-slate-300' },
  argent: { libelle: 'Certifié intermédiaire', classe: 'bg-slate-100 text-slate-700 ring-slate-300' },
  débutant: { libelle: 'Certifié débutant', classe: 'bg-orange-100 text-orange-800 ring-orange-300' },
  debutant: { libelle: 'Certifié débutant', classe: 'bg-orange-100 text-orange-800 ring-orange-300' },
  bronze: { libelle: 'Certifié débutant', classe: 'bg-orange-100 text-orange-800 ring-orange-300' },
}

const style = computed(() => {
  const connu = props.level ? STYLES[props.level] : undefined
  if (connu) return connu
  return {
    libelle: props.level ? `Certifié ${props.level}` : 'Non certifié',
    classe: 'bg-gray-100 text-gray-600 ring-gray-300',
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ring-1 ring-inset"
    :class="style.classe"
  >
    <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M10 1.5 12.6 6l5 .7-3.6 3.5.9 5L10 12.9 5.1 15.2l.9-5L2.4 6.7l5-.7L10 1.5Z"
        clip-rule="evenodd"
      />
    </svg>
    {{ style.libelle }}
  </span>
</template>
