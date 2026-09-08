<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import { computed } from 'vue';

import type { QuestionnaireQuestion } from '@/shared/types/api';

const props = defineProps<{
  question: QuestionnaireQuestion;
  modelValue: string[];
  position: number;
  total: number;
}>();

const emit = defineEmits<{ 'update:modelValue': [string[]] }>();

const selection = computed(() => new Set(props.modelValue));
const multiple = computed(() => props.question.type === 'multiple');

function idChamp(optionId: string): string {
  return `${props.question.id}-${optionId}`;
}

function basculer(optionId: string): void {
  if (!multiple.value) {
    emit('update:modelValue', [optionId]);
    return;
  }
  const suite = new Set(props.modelValue);
  if (suite.has(optionId)) suite.delete(optionId);
  else suite.add(optionId);
  emit('update:modelValue', [...suite]);
}
</script>

<template>
  <fieldset class="rounded-card border border-surface-line bg-surface-page p-6">
    <legend class="sr-only">Question {{ position }} sur {{ total }}</legend>

    <p class="mb-1 font-heading text-[12px] font-bold uppercase tracking-wide text-ink-muted">
      Question {{ position }} / {{ total }} ·
      {{ multiple ? 'plusieurs réponses possibles' : 'une seule réponse' }}
    </p>
    <p class="mb-4 text-[17px] font-medium">{{ question.prompt }}</p>

    <ul class="flex flex-col gap-2">
      <li v-for="option in question.options" :key="option.id">
        <div
          class="flex items-center gap-3 rounded-control border p-3 transition-colors"
          :class="
            selection.has(option.id)
              ? 'border-brand bg-brand-50'
              : 'border-surface-line hover:bg-surface-subtle'
          "
        >
          <!--
            Le composant PrimeVue gère lui-même son état, mais c'est `basculer`
            qui fait foi : le parent reste seul propriétaire de la sélection.
          -->
          <RadioButton
            v-if="!multiple"
            :input-id="idChamp(option.id)"
            :name="question.id"
            :value="option.id"
            :model-value="modelValue[0] ?? null"
            @update:model-value="basculer(option.id)"
          />
          <Checkbox
            v-else
            :input-id="idChamp(option.id)"
            :value="option.id"
            :model-value="modelValue"
            @update:model-value="basculer(option.id)"
          />
          <label :for="idChamp(option.id)" class="flex-1 cursor-pointer text-[14px]">
            {{ option.label }}
          </label>
        </div>
      </li>
    </ul>
  </fieldset>
</template>
