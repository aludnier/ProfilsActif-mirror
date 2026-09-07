<script setup lang="ts">
import { computed } from 'vue'

import type { QuestionnaireQuestion } from '@/shared/types/api'

const props = defineProps<{
  question: QuestionnaireQuestion
  modelValue: string[]
  position: number
  total: number
}>()

const emit = defineEmits<{ 'update:modelValue': [string[]] }>()

const selection = computed(() => new Set(props.modelValue))
const multiple = computed(() => props.question.type === 'multiple')

function basculer(optionId: string): void {
  if (!multiple.value) {
    emit('update:modelValue', [optionId])
    return
  }
  const suite = new Set(props.modelValue)
  if (suite.has(optionId)) suite.delete(optionId)
  else suite.add(optionId)
  emit('update:modelValue', [...suite])
}
</script>

<template>
  <fieldset class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
    <legend class="sr-only">Question {{ position }} sur {{ total }}</legend>

    <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
      Question {{ position }} / {{ total }} ·
      {{ multiple ? 'plusieurs réponses possibles' : 'une seule réponse' }}
    </p>
    <p class="mb-4 text-lg font-medium text-gray-900">{{ question.prompt }}</p>

    <ul class="space-y-2">
      <li v-for="option in question.options" :key="option.id">
        <label
          class="flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors"
          :class="
            selection.has(option.id)
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:bg-gray-50'
          "
        >
          <input
            :type="multiple ? 'checkbox' : 'radio'"
            :name="question.id"
            :value="option.id"
            :checked="selection.has(option.id)"
            class="h-4 w-4 shrink-0 accent-blue-600"
            @change="basculer(option.id)"
          />
          <span class="text-sm text-gray-800">{{ option.label }}</span>
        </label>
      </li>
    </ul>
  </fieldset>
</template>
