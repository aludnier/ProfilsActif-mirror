<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';

import CarteQuestion from '@/features/certification/components/CarteQuestion.vue';
import { useCertificationStore } from '@/features/certification/store';

const store = useCertificationStore();
const router = useRouter();
const {
  questionnaire,
  loading,
  saving,
  error,
  questions,
  total,
  currentQuestion,
  currentIndex,
  answers,
  answeredCount,
  isFirst,
  isLast,
  started,
  attemptId,
} = storeToRefs(store);

const reprise = ref<string | null>(null);

onMounted(async () => {
  await store.loadQuestionnaire();
  reprise.value = await store.repriseDisponible();
});

const passThreshold = computed(() => questionnaire.value?.content.config?.passThreshold ?? null);

async function reprendre() {
  if (reprise.value) await store.resume(reprise.value);
  reprise.value = null;
}

async function recommencer() {
  reprise.value = null;
  await store.start();
}

async function terminer() {
  const id = await store.submit();
  if (id) router.push({ name: 'candidate-certification-result', params: { attemptId: id } });
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="mx-auto max-w-2xl px-4">
      <!--
        Sans ce lien, l'écran est sans issue quand aucun questionnaire n'existe :
        il n'y a ni barre latérale ni bouton, seulement le message d'erreur.
      -->
      <router-link
        :to="{ name: 'candidate-dashboard' }"
        class="mb-6 inline-flex items-center gap-2 font-heading text-[14px] font-medium text-brand hover:underline"
      >
        <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M12.6672 8H3.3328M8 3.3328L3.3328 8L8 12.6672"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Retour au tableau de bord
      </router-link>

      <div v-if="loading" class="text-center text-gray-500">Chargement…</div>

      <div
        v-else-if="error && !questionnaire"
        class="rounded border border-amber-300 bg-amber-50 p-4 text-amber-800"
      >
        {{ error }}
      </div>

      <section v-else-if="!started && questionnaire" class="rounded-lg bg-white p-8 shadow-lg">
        <h1 class="text-2xl font-bold text-gray-900">{{ questionnaire.title }}</h1>
        <p class="mt-2 text-sm text-gray-500">
          {{ total }} question{{ total > 1 ? 's' : '' }}
          <template v-if="passThreshold !== null"> · réussite à {{ passThreshold }} %</template>
        </p>
        <p class="mt-4 text-sm text-gray-700">
          Vos réponses sont enregistrées au fur et à mesure : vous pouvez fermer la page et
          reprendre plus tard.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <template v-if="reprise">
            <button
              type="button"
              class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
              @click="reprendre"
            >
              Reprendre le test
            </button>
            <button
              type="button"
              class="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              @click="recommencer"
            >
              Recommencer à zéro
            </button>
          </template>
          <button
            v-else
            type="button"
            class="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            @click="recommencer"
          >
            Démarrer le test
          </button>
        </div>
      </section>

      <section v-else-if="started && currentQuestion" class="space-y-4">
        <div>
          <div class="mb-1 flex justify-between text-xs font-semibold text-gray-500">
            <span>{{ answeredCount }} / {{ total }} répondues</span>
            <span v-if="saving">Enregistrement…</span>
            <span v-else-if="attemptId">Enregistré</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              class="h-full rounded-full bg-blue-600 transition-all"
              :style="{ width: `${total ? (answeredCount / total) * 100 : 0}%` }"
            />
          </div>
        </div>

        <CarteQuestion
          :question="currentQuestion"
          :model-value="answers[currentQuestion.id] ?? []"
          :position="currentIndex + 1"
          :total="total"
          @update:model-value="store.setAnswer(currentQuestion.id, $event)"
        />

        <div class="flex items-center justify-between">
          <button
            type="button"
            class="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            :disabled="isFirst"
            @click="store.prev"
          >
            Précédent
          </button>

          <button
            v-if="!isLast"
            type="button"
            class="rounded-lg bg-gray-900 px-5 py-2.5 font-semibold text-white hover:bg-gray-800"
            @click="store.next"
          >
            Suivant
          </button>
          <button
            v-else
            type="button"
            class="rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white hover:bg-green-700 disabled:opacity-40"
            :disabled="loading"
            @click="terminer"
          >
            Terminer
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5 pt-2">
          <button
            v-for="(question, i) in questions"
            :key="question.id"
            type="button"
            class="h-8 w-8 rounded text-xs font-semibold"
            :class="[
              i === currentIndex
                ? 'bg-blue-600 text-white'
                : (answers[question.id]?.length ?? 0) > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-600',
            ]"
            @click="store.goTo(i)"
          >
            {{ i + 1 }}
          </button>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </section>
    </div>
  </div>
</template>
