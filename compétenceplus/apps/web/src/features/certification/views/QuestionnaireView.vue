<script setup lang="ts">
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import CarteQuestion from '@/features/certification/components/CarteQuestion.vue';
import CertificationService from '@/services/CertificationService';
import BadgeCertification from '@/shared/ui/BadgeCertification.vue';
import { niveauBadge } from '@/shared/certification';
import type { QuestionnaireAttempt } from '@/shared/types/api';
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
const derniere = ref<QuestionnaireAttempt | null>(null);

// Certification already obtained: the screen must say so instead of looking
// like a test that was never taken.
const scoreObtenu = computed(() =>
  derniere.value?.score === null || derniere.value?.score === undefined
    ? null
    : Math.round(Number(derniere.value.score)),
);

function formaterDate(valeur: string | null): string {
  return valeur ? new Date(valeur).toLocaleDateString('fr-FR', { dateStyle: 'long' }) : '';
}

onMounted(async () => {
  // Always land on the choice screen, never mid-test.
  store.revenirAuChoix();
  await store.loadQuestionnaire();
  reprise.value = await store.repriseDisponible();
  derniere.value = await CertificationService.getLastSubmittedAttempt().catch(() => null);
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
  <div class="min-h-screen bg-surface-subtle py-12">
    <div class="mx-auto max-w-2xl px-4">
      <!--
        Mid-test the way out is the choice screen, not the dashboard: answers
        are already saved, the attempt stays resumable. Without any link the
        screen would be a dead end when no questionnaire exists.
      -->
      <button
        v-if="started"
        type="button"
        class="mb-6 inline-flex items-center gap-2 font-heading text-[14px] font-medium text-brand hover:underline"
        @click="store.revenirAuChoix()"
      >
        <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M12.6672 8H3.3328M8 3.3328L3.3328 8L8 12.6672"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        Retour sur un autre questionnaire
      </button>

      <router-link
        v-else
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

      <p v-if="loading" class="text-center text-ink-muted">Chargement…</p>

      <!-- Pas d'erreur technique : aucun questionnaire n'est publié, d'où `warn`. -->
      <Message v-else-if="error && !questionnaire" severity="warn" :closable="false">
        {{ error }}
      </Message>

      <section
        v-else-if="!started && questionnaire"
        class="rounded-card border border-surface-line bg-surface-page p-8"
      >
        <h1 class="text-[24px]">{{ questionnaire.title }}</h1>
        <p class="mt-2 text-[14px] text-ink-muted">
          {{ total }} question{{ total > 1 ? 's' : '' }}
          <template v-if="passThreshold !== null"> · réussite à {{ passThreshold }} %</template>
        </p>
        <!-- Already certified: say it, instead of showing a pristine test. -->
        <div
          v-if="scoreObtenu !== null"
          class="mt-4 flex flex-wrap items-center gap-3 rounded-control border border-surface-line bg-surface-subtle p-4"
        >
          <BadgeCertification :level="niveauBadge(scoreObtenu)" />
          <p class="text-[14px]">
            <strong>{{ scoreObtenu }} %</strong> obtenus le
            {{ formaterDate(derniere?.submittedAt ?? null) }}.
          </p>
        </div>

        <p class="mt-4 text-[14px]">
          Vos réponses sont enregistrées au fur et à mesure : vous pouvez fermer la page et
          reprendre plus tard.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <template v-if="reprise">
            <Button
              label="Reprendre le test"
              class="rounded-control px-6 py-3 font-heading text-[14px] font-bold"
              @click="reprendre"
            />
            <Button
              label="Recommencer à zéro"
              severity="secondary"
              outlined
              class="rounded-control px-6 py-3 font-heading text-[14px] font-bold"
              @click="recommencer"
            />
          </template>
          <Button
            v-else
            :label="scoreObtenu === null ? 'Démarrer le test' : 'Repasser le test'"
            class="rounded-control px-6 py-3 font-heading text-[14px] font-bold"
            @click="recommencer"
          />
        </div>
      </section>

      <section v-else-if="started && currentQuestion" class="space-y-4">
        <div>
          <div class="mb-1 flex justify-between font-heading text-[12px] font-bold text-ink-muted">
            <span>{{ answeredCount }} / {{ total }} répondues</span>
            <span v-if="saving">Enregistrement…</span>
            <span v-else-if="attemptId">Enregistré</span>
          </div>
          <ProgressBar
            :value="total ? Math.round((answeredCount / total) * 100) : 0"
            :show-value="false"
            class="h-2"
            :aria-label="`${answeredCount} question(s) répondues sur ${total}`"
          />
        </div>

        <CarteQuestion
          :question="currentQuestion"
          :model-value="answers[currentQuestion.id] ?? []"
          :position="currentIndex + 1"
          :total="total"
          @update:model-value="store.setAnswer(currentQuestion.id, $event)"
        />

        <div class="flex items-center justify-between">
          <Button
            label="Précédent"
            severity="secondary"
            outlined
            class="rounded-control px-5 py-2.5 font-heading text-[14px] font-bold"
            :disabled="isFirst"
            @click="store.prev"
          />

          <Button
            v-if="!isLast"
            label="Suivant"
            class="rounded-control px-5 py-2.5 font-heading text-[14px] font-bold"
            @click="store.next"
          />
          <Button
            v-else
            label="Terminer"
            class="rounded-control px-5 py-2.5 font-heading text-[14px] font-bold"
            :disabled="loading"
            @click="terminer"
          />
        </div>

        <!--
          Pastilles de navigation : `aria-current` dit laquelle est ouverte, et
          le libellé porte l'état, que la seule couleur ne transmettrait pas.
        -->
        <nav aria-label="Aller à une question" class="flex flex-wrap gap-1.5 pt-2">
          <Button
            v-for="(question, i) in questions"
            :key="question.id"
            :label="String(i + 1)"
            :severity="i === currentIndex ? 'primary' : 'secondary'"
            :outlined="i !== currentIndex"
            :aria-current="i === currentIndex ? 'true' : undefined"
            :aria-label="`Question ${i + 1}${(answers[question.id]?.length ?? 0) > 0 ? ', répondue' : ''}`"
            class="size-8 rounded-control p-0 font-heading text-[12px] font-bold"
            :class="{
              'border-status-verified text-status-valid':
                i !== currentIndex && (answers[question.id]?.length ?? 0) > 0,
            }"
            @click="store.goTo(i)"
          />
        </nav>

        <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      </section>
    </div>
  </div>
</template>
