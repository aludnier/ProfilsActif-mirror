<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';

/*
 * La maquette dessine ces options en simple texte, sans radio ni case à
 * cocher : un panneau « FILTRES AVANCÉS » sans état visible ni cible
 * cliquable. On pose de vrais contrôles PrimeVue — « Niveau d'expérience »
 * est un choix unique (« Tous niveaux » en fait partie), « Durée de la vidéo »
 * un choix multiple.
 *
 * L'état remonte à la vue via defineModel : à terme il vivra dans la query
 * string, comme les chips de l'en-tête.
 */
const niveau = defineModel<string>('niveau', { required: true });
const durees = defineModel<string[]>('durees', { required: true });

const niveaux = ['Tous niveaux', 'Junior (0 - 2 ans)', 'Confirmé (2 - 7 ans)', 'Sénior (7 ans +)'];

const dureesVideo = ["Moins d'une minute", 'Entre 1 et 2 minutes'];
</script>

<template>
  <aside
    class="flex w-[280px] shrink-0 flex-col items-start gap-6 border-r border-surface-line bg-surface-page p-6"
  >
    <div class="flex w-full flex-col items-start gap-3">
      <h2 class="font-heading text-[12px] uppercase tracking-[0.5px] text-ink-muted">
        Filtres avancés
      </h2>
      <span class="h-px w-full bg-surface-line" aria-hidden="true" />
    </div>

    <fieldset class="flex w-full flex-col items-start gap-3">
      <legend class="mb-3 font-heading text-[14px] font-bold text-brand">
        Niveau d'expérience
      </legend>
      <div class="flex w-full flex-col items-start gap-2">
        <div v-for="option in niveaux" :key="option" class="flex items-center gap-2">
          <RadioButton v-model="niveau" :input-id="option" name="niveau" :value="option" />
          <label :for="option" class="cursor-pointer font-heading text-[14px]">{{ option }}</label>
        </div>
      </div>
    </fieldset>

    <fieldset class="flex w-full flex-col items-start gap-3">
      <legend class="mb-3 font-heading text-[14px] font-bold text-brand">Durée de la vidéo</legend>
      <div class="flex w-full flex-col items-start gap-2">
        <div v-for="option in dureesVideo" :key="option" class="flex items-center gap-2">
          <Checkbox v-model="durees" :input-id="option" :value="option" />
          <label :for="option" class="cursor-pointer font-heading text-[14px]">{{ option }}</label>
        </div>
      </div>
    </fieldset>

    <div class="flex w-full flex-col items-start gap-2 rounded-control bg-surface-subtle p-4">
      <h3 class="font-heading text-[12px] uppercase text-brand">Accès recruteur</h3>
      <p class="text-[12px] leading-[1.5] text-ink-muted">
        La consultation implique l'acceptation de notre charte anti-discrimination et de déontologie
        du service public.
      </p>
    </div>
  </aside>
</template>
