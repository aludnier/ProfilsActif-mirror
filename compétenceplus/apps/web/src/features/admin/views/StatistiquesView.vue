<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import AdminService from '@/features/admin/api';
import NavAdmin from '@/features/admin/components/NavAdmin.vue';
import type { AdminStats } from '@/shared/types/api';

const stats = ref<AdminStats | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

async function charger(): Promise<void> {
  loading.value = true;
  error.value = null;
  try {
    stats.value = await AdminService.getStats();
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Impossible de charger les statistiques.';
  } finally {
    loading.value = false;
  }
}

const partCertifies = computed(() => {
  const s = stats.value;
  if (!s || s.activeSeekers === 0) return 0;
  return Math.round((s.certifiedSeekers / s.activeSeekers) * 100);
});

type Carte = { libelle: string; valeur: number; suffixe?: string; precision?: string };
type Groupe = { titre: string; cartes: Carte[] };

const groupes = computed<Groupe[]>(() => {
  const s = stats.value;
  if (!s) return [];
  return [
    {
      titre: 'Profils actifs',
      cartes: [
        { libelle: 'Candidats', valeur: s.activeSeekers },
        { libelle: 'Recruteurs', valeur: s.activeRecruiters },
        { libelle: 'Comptes suspendus', valeur: s.suspendedUsers },
      ],
    },
    {
      titre: 'Certification',
      cartes: [
        {
          libelle: 'Candidats certifiés',
          valeur: s.certifiedSeekers,
          // A share is not a unit: as a suffix it read « 27 68 % ».
          precision: `${partCertifies.value} % des candidats actifs`,
        },
        { libelle: 'Score moyen', valeur: s.avgCertificationRate, suffixe: '%' },
        { libelle: 'Passations soumises', valeur: s.submittedAttempts },
      ],
    },
    {
      titre: 'Interactions',
      cartes: [
        { libelle: 'Prises de contact', valeur: s.totalContacts },
        { libelle: 'Mises en favori', valeur: s.totalFavorites },
      ],
    },
    {
      titre: 'Modération vidéo',
      cartes: [
        { libelle: 'En attente', valeur: s.pendingVideos },
        { libelle: 'Approuvées', valeur: s.approvedVideos },
      ],
    },
  ];
});

onMounted(charger);
</script>

<template>
  <main class="min-h-screen bg-surface-subtle p-6 lg:p-10">
    <div class="mx-auto flex max-w-6xl flex-col gap-8">
      <NavAdmin />

      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-[28px] text-brand">Tableau de bord global</h1>
          <p class="text-[15px] text-ink-muted">
            Profils actifs, certification et interactions sur la plateforme.
          </p>
        </div>
        <button
          type="button"
          class="rounded-control border border-surface-line px-4 py-2 font-heading text-[13px] font-medium text-ink hover:bg-surface-subtle"
          :disabled="loading"
          @click="charger"
        >
          Actualiser
        </button>
      </header>

      <p v-if="loading" class="text-[15px] text-ink-muted">Chargement…</p>

      <p
        v-else-if="error"
        class="rounded-card border border-red-300 bg-red-50 p-4 text-[14px] text-red-700"
      >
        {{ error }}
      </p>

      <div v-else-if="stats" class="flex flex-col gap-8">
        <section v-for="groupe in groupes" :key="groupe.titre" class="flex flex-col gap-3">
          <h2 class="font-heading text-[12px] font-bold uppercase tracking-[0.5px] text-ink-muted">
            {{ groupe.titre }}
          </h2>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article
              v-for="carte in groupe.cartes"
              :key="carte.libelle"
              class="rounded-card border border-surface-line bg-surface-page p-5"
            >
              <p class="text-[13px] text-ink-muted">{{ carte.libelle }}</p>
              <p class="mt-1 font-heading text-[30px] font-bold text-brand">
                {{ carte.valeur
                }}<span v-if="carte.suffixe" class="ml-1 text-[15px] font-medium text-ink-muted">{{
                  carte.suffixe
                }}</span>
              </p>
              <p v-if="carte.precision" class="mt-1 text-[13px] text-ink-muted">
                {{ carte.precision }}
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
