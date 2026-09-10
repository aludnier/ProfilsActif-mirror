<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import { onMounted, ref } from 'vue';

import SkillService from '@/services/SkillService';

const MAX_COMPETENCES = 5;

const competences = defineModel<string[]>({ required: true });

/*
 * Catalogue from GET /skills, offered through the dropdown only. `typeahead`
 * has to stay off: AutoComplete only accepts free text on Enter when it is,
 * and the skill table is empty today — a suggestion-only field would let the
 * candidate type nothing at all. The dropdown appears once the table fills up.
 */
const catalogue = ref<string[]>([]);
const suggestions = ref<string[]>([]);
const avertissement = ref('');

onMounted(async () => {
  try {
    catalogue.value = (await SkillService.getAllSkills()).map((skill) => skill.name);
  } catch {
    /* An unreachable catalogue must not break the field, only its suggestions. */
  }
});

function rechercher(evenement: { query: string }): void {
  const requete = evenement.query.trim().toLowerCase();

  suggestions.value = catalogue.value.filter(
    (nom) => nom.toLowerCase().includes(requete) && !competences.value.includes(nom),
  );
}

/*
 * The limit is enforced by refusing the new value rather than by disabling the
 * field: a disabled AutoComplete also disables its chips, so the candidate
 * could no longer remove one to make room.
 */
function limiter(valeur: string[]): void {
  if (valeur.length > MAX_COMPETENCES) {
    avertissement.value = `${MAX_COMPETENCES} mots-clés au maximum. Retirez-en un pour en ajouter un autre.`;
    return;
  }

  avertissement.value = '';
  competences.value = valeur;
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label for="competences" class="font-heading text-[15px] font-semibold text-brand">
      Mots-clés de compétences clés (max {{ MAX_COMPETENCES }})
    </label>

    <AutoComplete
      input-id="competences"
      :model-value="competences"
      :suggestions="suggestions"
      multiple
      :typeahead="false"
      :dropdown="catalogue.length > 0"
      placeholder="Ajouter un mot-clé, puis Entrée"
      class="w-full"
      fluid
      @complete="rechercher"
      @update:model-value="limiter"
    />

    <p v-if="avertissement" class="font-heading text-[13px] text-action">
      {{ avertissement }}
    </p>
    <p v-else class="font-heading text-[13px] text-ink-muted">
      {{ competences.length }} / {{ MAX_COMPETENCES }} — enregistré avec votre profil.
    </p>
  </div>
</template>
