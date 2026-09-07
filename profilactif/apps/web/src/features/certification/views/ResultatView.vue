<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useCertificationStore } from '@/features/certification/store'
import CertificationService from '@/services/CertificationService'
import BadgeCertification from '@/shared/ui/BadgeCertification.vue'
import type { CategoryScore } from '@/shared/types/api'

const props = defineProps<{ attemptId: string }>()

const store = useCertificationStore()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const nonTermine = ref(false)

const score = ref<number | null>(null)
const passThreshold = ref<number | null>(null)
const badgeLevel = ref<string | null>(null)
const categories = ref<CategoryScore[]>([])

function niveauBadge(bandes: { min: number; level: string }[] | undefined, valeur: number): string | null {
  for (const bande of [...(bandes ?? [])].sort((a, b) => b.min - a.min)) {
    if (valeur >= bande.min) return bande.level
  }
  return null
}

const reussi = computed(
  () => score.value !== null && passThreshold.value !== null && score.value >= passThreshold.value,
)

onMounted(async () => {
  loading.value = true
  error.value = null
  try {
    if (store.result && store.attemptId === props.attemptId) {
      score.value = store.result.score
      badgeLevel.value = store.result.badgeLevel
      categories.value = store.result.categories
      passThreshold.value = store.questionnaire?.content.config?.passThreshold ?? null
      return
    }
    const [attempt, questionnaire] = await Promise.all([
      CertificationService.getAttempt(props.attemptId),
      CertificationService.getPublished(),
    ])

    if (attempt.status !== 'submitted') {
      nonTermine.value = true
      return
    }

    score.value = Math.round(Number(attempt.score ?? 0))
    passThreshold.value = questionnaire.content.config?.passThreshold ?? null
    badgeLevel.value = reussi.value
      ? niveauBadge(questionnaire.content.config?.badgeBands, score.value)
      : null
    categories.value = []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Résultat introuvable'
  } finally {
    loading.value = false
  }
})

function repasser() {
  store.reset()
  router.push({ name: 'candidate-certification' })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-2xl px-4">
      <div v-if="loading" class="text-center text-gray-500">Chargement du résultat…</div>

      <div v-else-if="error" class="rounded border border-red-300 bg-red-50 p-4 text-red-700">
        {{ error }}
      </div>

      <div
        v-else-if="nonTermine"
        class="rounded-lg bg-white p-8 text-center shadow-lg"
      >
        <h1 class="text-xl font-bold text-gray-800">Test non terminé</h1>
        <p class="mt-2 text-sm text-gray-600">Cette tentative n'a pas encore été soumise.</p>
        <button
          type="button"
          class="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white hover:bg-blue-700"
          @click="router.push({ name: 'candidate-certification' })"
        >
          Reprendre le test
        </button>
      </div>

      <article v-else class="space-y-6">
        <div
          class="rounded-lg p-8 text-center shadow-lg"
          :class="reussi ? 'bg-green-50' : 'bg-white'"
        >
          <p class="text-sm font-semibold uppercase tracking-wide text-gray-500">Score global</p>
          <p class="my-2 text-6xl font-extrabold" :class="reussi ? 'text-green-700' : 'text-gray-900'">
            {{ score }}<span class="text-2xl font-bold text-gray-400"> %</span>
          </p>
          <p class="text-lg font-semibold" :class="reussi ? 'text-green-700' : 'text-red-600'">
            {{ reussi ? 'Certification réussie' : 'Certification non obtenue' }}
            <template v-if="passThreshold !== null">
              <span class="text-sm font-normal text-gray-500"> (seuil {{ passThreshold }} %)</span>
            </template>
          </p>
          <div class="mt-4">
            <BadgeCertification :level="badgeLevel" />
          </div>
        </div>

        <section v-if="categories.length" class="rounded-lg bg-white p-6 shadow-lg">
          <h2 class="mb-3 text-lg font-semibold text-gray-800">Détail par catégorie</h2>
          <ul class="divide-y divide-gray-100">
            <li
              v-for="categorie in categories"
              :key="categorie.code"
              class="flex items-center justify-between py-3"
            >
              <span class="font-medium text-gray-900">{{ categorie.label }}</span>
              <span class="text-sm font-semibold text-gray-600">{{ categorie.score }} %</span>
            </li>
          </ul>
        </section>

        <div class="flex flex-wrap gap-3">
          <button
            type="button"
            class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            @click="router.push({ name: 'candidate-dashboard' })"
          >
            Retour à mon profil
          </button>
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
            @click="repasser"
          >
            Repasser le test
          </button>
        </div>
      </article>
    </div>
  </div>
</template>
