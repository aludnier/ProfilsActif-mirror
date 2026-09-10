<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useCertificationStore } from '@/features/certification/store';
import CertificationService from '@/services/CertificationService';
import BadgeCertification from '@/shared/ui/BadgeCertification.vue';
import type { CategoryScore } from '@/shared/types/api';

const props = defineProps<{ attemptId: string }>();

const store = useCertificationStore();
const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);
const nonTermine = ref(false);

const score = ref<number | null>(null);
const passThreshold = ref<number | null>(null);
const badgeLevel = ref<string | null>(null);
const categories = ref<CategoryScore[]>([]);

function niveauBadge(
  bandes: { min: number; level: string }[] | undefined,
  valeur: number,
): string | null {
  for (const bande of [...(bandes ?? [])].sort((a, b) => b.min - a.min)) {
    if (valeur >= bande.min) return bande.level;
  }
  return null;
}

const reussi = computed(
  () => score.value !== null && passThreshold.value !== null && score.value >= passThreshold.value,
);

onMounted(async () => {
  loading.value = true;
  error.value = null;
  try {
    if (store.result && store.attemptId === props.attemptId) {
      score.value = store.result.score;
      badgeLevel.value = store.result.badgeLevel;
      categories.value = store.result.categories;
      passThreshold.value = store.questionnaire?.content.config?.passThreshold ?? null;
      return;
    }
    const [attempt, questionnaire] = await Promise.all([
      CertificationService.getAttempt(props.attemptId),
      CertificationService.getPublished(),
    ]);

    if (attempt.status !== 'submitted') {
      nonTermine.value = true;
      return;
    }

    score.value = Math.round(Number(attempt.score ?? 0));
    passThreshold.value = questionnaire.content.config?.passThreshold ?? null;
    badgeLevel.value = reussi.value
      ? niveauBadge(questionnaire.content.config?.badgeBands, score.value)
      : null;
    categories.value = [];
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Résultat introuvable';
  } finally {
    loading.value = false;
  }
});

function repasser() {
  store.reset();
  router.push({ name: 'candidate-certification' });
}
</script>

<template>
  <div class="min-h-screen bg-surface-subtle py-12">
    <div class="mx-auto max-w-2xl px-4">
      <p v-if="loading" class="text-center text-ink-muted">Chargement du résultat…</p>

      <Message v-else-if="error" severity="error" :closable="false">{{ error }}</Message>

      <div
        v-else-if="nonTermine"
        class="rounded-card border border-surface-line bg-surface-page p-8 text-center"
      >
        <h1 class="text-[20px]">Test non terminé</h1>
        <p class="mt-2 text-[14px] text-ink-muted">Cette tentative n'a pas encore été soumise.</p>
        <Button
          label="Reprendre le test"
          class="mt-4 rounded-control px-5 py-2.5 font-heading text-[14px] font-bold"
          @click="router.push({ name: 'candidate-certification' })"
        />
      </div>

      <article v-else class="space-y-6">
        <div
          class="rounded-card border p-8 text-center"
          :class="
            reussi
              ? 'border-status-verified bg-surface-page'
              : 'border-surface-line bg-surface-page'
          "
        >
          <p class="font-heading text-[13px] font-bold uppercase tracking-wide text-ink-muted">
            Score global
          </p>
          <p class="my-2 text-[56px] font-bold leading-none text-brand">
            {{ score }}<span class="text-[24px] text-ink-muted"> %</span>
          </p>
          <p
            class="font-heading text-[17px] font-bold"
            :class="reussi ? 'text-status-valid' : 'text-ink'"
          >
            {{ reussi ? 'Certification réussie' : 'Certification non obtenue' }}
            <template v-if="passThreshold !== null">
              <span class="font-normal text-ink-muted">(seuil {{ passThreshold }} %)</span>
            </template>
          </p>
          <div class="mt-4">
            <BadgeCertification :level="badgeLevel" />
          </div>
        </div>

        <section
          v-if="categories.length"
          class="rounded-card border border-surface-line bg-surface-page p-6"
        >
          <h2 class="mb-3 text-[17px]">Détail par catégorie</h2>
          <ul class="flex flex-col gap-4">
            <li v-for="categorie in categories" :key="categorie.code">
              <div class="flex items-center justify-between pb-1">
                <span class="font-heading text-[14px] font-medium">{{ categorie.label }}</span>
                <span class="font-heading text-[14px] font-bold text-ink-muted">
                  {{ categorie.score }} %
                </span>
              </div>
              <!-- La barre double le chiffre : `showValue` ferait doublon. -->
              <ProgressBar
                :value="categorie.score"
                :show-value="false"
                class="h-2"
                :aria-label="`${categorie.label} : ${categorie.score} %`"
              />
            </li>
          </ul>
        </section>

        <div class="flex flex-wrap gap-3">
          <Button
            label="Retour à mon profil"
            class="rounded-control px-6 py-3 font-heading text-[14px] font-bold"
            @click="router.push({ name: 'candidate-dashboard' })"
          />
          <Button
            label="Repasser le test"
            severity="secondary"
            outlined
            class="rounded-control px-6 py-3 font-heading text-[14px] font-bold"
            @click="repasser"
          />
        </div>
      </article>
    </div>
  </div>
</template>
