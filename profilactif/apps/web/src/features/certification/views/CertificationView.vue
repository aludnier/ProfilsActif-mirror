<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import CertificationService from '@/services/CertificationService'
import type { Questionnaire, QuestionnaireCategory, QuestionnaireQuestion } from '@/shared/types/api'

const questionnaire = ref<Questionnaire | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadQuestionnaire() {
  loading.value = true
  error.value = null

  try {
    questionnaire.value = await CertificationService.getPublished()
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Aucune certification publiée pour le moment'
  } finally {
    loading.value = false
  }
}

const categories = computed(() => questionnaire.value?.content.categories ?? [])
const questions = computed(() => questionnaire.value?.content.questions ?? [])
const passThreshold = computed(() => questionnaire.value?.content.config?.passThreshold ?? null)

/** Catégorie fictive pour les questions dont le code ne correspond à rien. */
const CATEGORIE_ORPHELINE: QuestionnaireCategory = {
  code: '__autres__',
  label: 'Autres questions',
  weight: 0,
}

/** Les catégories déclarées, chacune avec ses questions ; + un groupe "Autres". */
const groupes = computed<{ categorie: QuestionnaireCategory; questions: QuestionnaireQuestion[] }[]>(
  () => {
    const parCode = new Map<string, QuestionnaireQuestion[]>()
    for (const question of questions.value) {
      const liste = parCode.get(question.category) ?? []
      liste.push(question)
      parCode.set(question.category, liste)
    }

    const resultat = categories.value.map((categorie) => ({
      categorie,
      questions: parCode.get(categorie.code) ?? [],
    }))

    const codesConnus = new Set(categories.value.map((c) => c.code))
    const orphelines = questions.value.filter((q) => !codesConnus.has(q.category))
    if (orphelines.length) {
      resultat.push({ categorie: CATEGORIE_ORPHELINE, questions: orphelines })
    }

    return resultat
  },
)

function libelleType(type: QuestionnaireQuestion['type']): string {
  return type === 'multiple' ? 'Choix multiple' : 'Choix unique'
}

function lettre(index: number): string {
  return String.fromCharCode(97 + index) // 0 -> "a"
}

function formaterDate(valeur: string | null): string {
  return valeur ? new Date(valeur).toLocaleDateString('fr-FR') : '—'
}

onMounted(loadQuestionnaire)
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-3xl px-4">
      <!-- Chargement -->
      <div v-if="loading" class="text-center text-gray-500">Chargement de la certification…</div>

      <!-- Erreur / aucune certification -->
      <div
        v-else-if="error"
        class="rounded border border-amber-300 bg-amber-50 p-4 text-amber-800"
      >
        {{ error }}
      </div>

      <!-- Certification -->
      <article v-else-if="questionnaire" class="space-y-8">
        <!-- En-tête -->
        <header class="rounded-lg bg-white p-8 shadow-lg">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span
              class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-800"
            >
              {{ questionnaire.code }}
            </span>
            <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              Version {{ questionnaire.version }}
            </span>
            <span
              class="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase text-green-800"
            >
              {{ questionnaire.status }}
            </span>
          </div>

          <h1 class="text-3xl font-bold text-gray-900">{{ questionnaire.title }}</h1>

          <p class="mt-2 text-sm text-gray-500">
            Publiée le {{ formaterDate(questionnaire.publishedAt) }} ·
            {{ questions.length }} question{{ questions.length > 1 ? 's' : '' }} ·
            {{ categories.length }} catégorie{{ categories.length > 1 ? 's' : '' }}
            <template v-if="passThreshold !== null"> · réussite à {{ passThreshold }} %</template>
          </p>
        </header>

        <!-- Aucune question -->
        <p
          v-if="!questions.length"
          class="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-lg"
        >
          Ce questionnaire ne contient aucune question.
        </p>

        <!-- Questions groupées par catégorie -->
        <section
          v-for="groupe in groupes"
          :key="groupe.categorie.code"
          class="rounded-lg bg-white p-8 shadow-lg"
        >
          <div class="mb-4 flex items-baseline justify-between border-b border-gray-100 pb-3">
            <h2 class="text-lg font-semibold text-gray-800">{{ groupe.categorie.label }}</h2>
            <span class="text-xs font-semibold uppercase text-gray-400">
              <template v-if="groupe.categorie.weight > 0">poids {{ groupe.categorie.weight }} · </template>
              {{ groupe.questions.length }} question(s)
            </span>
          </div>

          <ol class="space-y-6">
            <li v-for="(question, i) in groupe.questions" :key="question.id">
              <div class="mb-2 flex items-start gap-2">
                <span class="font-semibold text-gray-500">{{ i + 1 }}.</span>
                <div>
                  <p class="font-medium text-gray-900">{{ question.prompt }}</p>
                  <span class="text-xs uppercase tracking-wide text-gray-400">
                    {{ libelleType(question.type) }}
                  </span>
                </div>
              </div>

              <ul class="ml-6 space-y-1.5">
                <li
                  v-for="(option, j) in question.options"
                  :key="option.id"
                  class="flex gap-2 text-sm text-gray-700"
                >
                  <span class="font-semibold text-gray-400">{{ lettre(j) }}.</span>
                  <span>{{ option.label }}</span>
                </li>
              </ul>
            </li>
          </ol>
        </section>
      </article>

      <!-- Rien -->
      <div v-else class="rounded-lg bg-white p-8 text-center shadow-lg">
        <h2 class="text-xl font-bold text-gray-800">Aucune certification disponible</h2>
      </div>
    </div>
  </div>
</template>
