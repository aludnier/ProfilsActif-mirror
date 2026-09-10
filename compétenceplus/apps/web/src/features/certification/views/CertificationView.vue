<script setup lang="ts">
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { ref, computed, onMounted } from 'vue';

import CertificationService from '@/services/CertificationService';
import type {
  Questionnaire,
  QuestionnaireCategory,
  QuestionnaireQuestion,
} from '@/shared/types/api';

const questionnaire = ref<Questionnaire | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadQuestionnaire() {
  loading.value = true;
  error.value = null;

  try {
    questionnaire.value = await CertificationService.getPublished();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'Aucune certification publiée pour le moment';
  } finally {
    loading.value = false;
  }
}

const categories = computed(() => questionnaire.value?.content.categories ?? []);
const questions = computed(() => questionnaire.value?.content.questions ?? []);
const passThreshold = computed(() => questionnaire.value?.content.config?.passThreshold ?? null);

/** Catégorie fictive pour les questions dont le code ne correspond à rien. */
const CATEGORIE_ORPHELINE: QuestionnaireCategory = {
  code: '__autres__',
  label: 'Autres questions',
  weight: 0,
};

/** Les catégories déclarées, chacune avec ses questions ; + un groupe "Autres". */
const groupes = computed<
  { categorie: QuestionnaireCategory; questions: QuestionnaireQuestion[] }[]
>(() => {
  const parCode = new Map<string, QuestionnaireQuestion[]>();
  for (const question of questions.value) {
    const liste = parCode.get(question.category) ?? [];
    liste.push(question);
    parCode.set(question.category, liste);
  }

  const resultat = categories.value.map((categorie) => ({
    categorie,
    questions: parCode.get(categorie.code) ?? [],
  }));

  const codesConnus = new Set(categories.value.map((c) => c.code));
  const orphelines = questions.value.filter((q) => !codesConnus.has(q.category));
  if (orphelines.length) {
    resultat.push({ categorie: CATEGORIE_ORPHELINE, questions: orphelines });
  }

  return resultat;
});

function libelleType(type: QuestionnaireQuestion['type']): string {
  return type === 'multiple' ? 'Choix multiple' : 'Choix unique';
}

function lettre(index: number): string {
  return String.fromCharCode(97 + index); // 0 -> "a"
}

function formaterDate(valeur: string | null): string {
  return valeur ? new Date(valeur).toLocaleDateString('fr-FR') : '—';
}

onMounted(loadQuestionnaire);
</script>

<template>
  <div class="min-h-screen bg-surface-subtle py-12">
    <div class="mx-auto max-w-3xl px-4">
      <p v-if="loading" class="text-center text-ink-muted">Chargement de la certification…</p>

      <!-- Pas de panne : simplement aucune certification publiée, d'où `warn`. -->
      <Message v-else-if="error" severity="warn" :closable="false">{{ error }}</Message>

      <article v-else-if="questionnaire" class="space-y-8">
        <header class="rounded-card border border-surface-line bg-surface-page p-8">
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <Tag
              rounded
              :value="questionnaire.code"
              class="bg-brand-50 px-3 py-1 font-heading text-[12px] font-bold uppercase text-brand"
            />
            <Tag
              rounded
              :value="`Version ${questionnaire.version}`"
              class="bg-surface-muted px-3 py-1 font-heading text-[12px] font-bold text-ink"
            />
            <Tag
              rounded
              :value="questionnaire.status"
              class="bg-status-verified px-3 py-1 font-heading text-[12px] font-bold uppercase text-on-status-verified"
            />
          </div>

          <h1 class="text-[30px]">{{ questionnaire.title }}</h1>

          <p class="mt-2 text-[14px] text-ink-muted">
            Publiée le {{ formaterDate(questionnaire.publishedAt) }} ·
            {{ questions.length }} question{{ questions.length > 1 ? 's' : '' }} ·
            {{ categories.length }} catégorie{{ categories.length > 1 ? 's' : '' }}
            <template v-if="passThreshold !== null"> · réussite à {{ passThreshold }} %</template>
          </p>
        </header>

        <p
          v-if="!questions.length"
          class="rounded-card border border-surface-line bg-surface-page p-6 text-[14px] text-ink-muted"
        >
          Ce questionnaire ne contient aucune question.
        </p>

        <section
          v-for="groupe in groupes"
          :key="groupe.categorie.code"
          class="rounded-card border border-surface-line bg-surface-page p-8"
        >
          <div
            class="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-surface-line pb-3"
          >
            <h2 class="text-[17px]">{{ groupe.categorie.label }}</h2>
            <span class="font-heading text-[12px] font-bold uppercase text-ink-muted">
              <template v-if="groupe.categorie.weight > 0">
                poids {{ groupe.categorie.weight }} ·
              </template>
              {{ groupe.questions.length }} question(s)
            </span>
          </div>

          <ol class="flex flex-col gap-6">
            <li v-for="(question, i) in groupe.questions" :key="question.id">
              <div class="mb-2 flex items-start gap-2">
                <span class="font-heading font-bold text-ink-muted">{{ i + 1 }}.</span>
                <div>
                  <p class="font-medium">{{ question.prompt }}</p>
                  <span class="font-heading text-[12px] uppercase tracking-wide text-ink-muted">
                    {{ libelleType(question.type) }}
                  </span>
                </div>
              </div>

              <ul class="ml-6 flex flex-col gap-1.5">
                <li
                  v-for="(option, j) in question.options"
                  :key="option.id"
                  class="flex gap-2 text-[14px]"
                >
                  <span class="font-heading font-bold text-ink-muted">{{ lettre(j) }}.</span>
                  <span>{{ option.label }}</span>
                </li>
              </ul>
            </li>
          </ol>
        </section>
      </article>

      <div v-else class="rounded-card border border-surface-line bg-surface-page p-8 text-center">
        <h2 class="text-[20px]">Aucune certification disponible</h2>
      </div>
    </div>
  </div>
</template>
