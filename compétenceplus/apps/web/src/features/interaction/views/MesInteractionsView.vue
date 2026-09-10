<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import BarreLateraleCandidat from '@/features/profil/components/BarreLateraleCandidat.vue';
import InteractionService from '@/services/InteractionService';
import type { AppNotification } from '@/shared/types/api';

type Filtre = 'toutes' | 'non-lues';

const notifications = ref<AppNotification[]>([]);
const chargement = ref(false);
const erreur = ref<string | null>(null);
const filtre = ref<Filtre>('toutes');

const nonLues = computed(() => notifications.value.filter((n) => !n.read).length);

const affichees = computed(() =>
  filtre.value === 'non-lues' ? notifications.value.filter((n) => !n.read) : notifications.value,
);

async function charger(): Promise<void> {
  chargement.value = true;
  erreur.value = null;
  try {
    notifications.value = await InteractionService.listNotifications();
  } catch (e) {
    erreur.value = e instanceof Error ? e.message : 'Impossible de charger vos interactions.';
  } finally {
    chargement.value = false;
  }
}

async function marquerLue(notification: AppNotification): Promise<void> {
  if (notification.read) return;
  await InteractionService.markRead(notification.id);
  notification.read = true;
}

async function toutMarquerLu(): Promise<void> {
  await InteractionService.markAllRead();
  notifications.value = notifications.value.map((n) => ({ ...n, read: true }));
}

function initiales(nom: string | null): string {
  if (!nom) return 'R';
  return nom
    .split(/\s+/)
    .slice(0, 2)
    .map((mot) => mot.charAt(0).toUpperCase())
    .join('');
}

function formaterDate(valeur: string): string {
  return new Date(valeur).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

onMounted(charger);
</script>

<template>
  <div class="flex min-h-screen items-stretch">
    <BarreLateraleCandidat class="hidden lg:flex" />

    <main class="flex min-w-0 flex-1 flex-col gap-8 bg-surface-subtle p-6 lg:p-10">
      <header class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-[28px]">Mes interactions</h1>
          <p class="text-[15px] text-ink-muted">
            Les recruteurs qui ont pris contact avec vous, du plus récent au plus ancien.
          </p>
        </div>

        <div class="flex items-center gap-4">
          <span
            class="rounded-badge bg-action px-3 py-1 font-heading text-[13px] font-bold text-on-action"
            :class="{ 'bg-surface-muted text-ink-muted': nonLues === 0 }"
          >
            {{ nonLues }} non lue{{ nonLues > 1 ? 's' : '' }}
          </span>
          <button
            v-if="nonLues > 0"
            type="button"
            class="rounded-control border border-surface-line px-4 py-2 font-heading text-[13px] font-medium text-ink hover:bg-surface-subtle"
            @click="toutMarquerLu"
          >
            Tout marquer comme lu
          </button>
        </div>
      </header>

      <!-- Filtres -->
      <div class="flex gap-2">
        <button
          v-for="option in [
            { cle: 'toutes', libelle: 'Toutes' },
            { cle: 'non-lues', libelle: 'Non lues' },
          ]"
          :key="option.cle"
          type="button"
          class="rounded-control px-4 py-2 font-heading text-[13px] font-medium"
          :class="
            filtre === option.cle
              ? 'bg-brand text-on-brand'
              : 'bg-surface-page text-ink border border-surface-line hover:bg-surface-subtle'
          "
          @click="filtre = option.cle as Filtre"
        >
          {{ option.libelle }}
        </button>
      </div>

      <p v-if="chargement" class="text-[15px] text-ink-muted">Chargement…</p>

      <p
        v-else-if="erreur"
        class="rounded-card border border-red-300 bg-red-50 p-4 text-[14px] text-red-700"
      >
        {{ erreur }}
      </p>

      <div
        v-else-if="affichees.length === 0"
        class="flex flex-col items-center gap-2 rounded-card border border-surface-line bg-surface-page p-12 text-center"
      >
        <p class="font-heading text-[16px] font-bold text-ink">
          {{ filtre === 'non-lues' ? 'Aucune interaction non lue' : 'Aucune interaction pour le moment' }}
        </p>
        <p class="text-[14px] text-ink-muted">
          Complétez votre profil et votre vidéo pour être repéré par les recruteurs.
        </p>
      </div>

      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="notification in affichees"
          :key="notification.id"
          class="flex gap-4 rounded-card border bg-surface-page p-5"
          :class="notification.read ? 'border-surface-line' : 'border-brand'"
        >
          <div
            class="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand font-heading text-[14px] font-bold text-on-brand"
            aria-hidden="true"
          >
            {{ initiales(notification.recruiterName) }}
          </div>

          <div class="flex min-w-0 flex-1 flex-col gap-2">
            <div class="flex flex-wrap items-center gap-2">
              <span
                v-if="!notification.read"
                class="size-2 shrink-0 rounded-full bg-brand"
                aria-label="Non lue"
              />
              <p class="font-heading text-[15px] font-bold text-ink">
                {{ notification.recruiterName ?? 'Un recruteur' }}
                <span class="font-medium text-ink-muted">vous a contacté</span>
              </p>
            </div>

            <p class="text-[12px] italic text-ink-muted">{{ formaterDate(notification.createdAt) }}</p>

            <p
              v-if="notification.message"
              class="mt-1 whitespace-pre-line border-l-2 border-surface-line pl-3 text-[14px] leading-[1.6] text-ink"
            >
              {{ notification.message }}
            </p>

            <p class="mt-1 rounded-control bg-surface-muted px-3 py-2 text-[13px] text-ink">
              📧 Un email vous a été envoyé — consultez votre boîte de réception (et vos spams).
              <template v-if="notification.recruiterMail || notification.recruiterPhone">
                <br />
                <span class="text-ink-muted">Pour répondre :</span>
                <span v-if="notification.recruiterMail" class="font-medium">
                  {{ notification.recruiterMail }}</span>
                <span v-if="notification.recruiterMail && notification.recruiterPhone"> · </span>
                <span v-if="notification.recruiterPhone" class="font-medium">
                  {{ notification.recruiterPhone }}</span>
              </template>
            </p>

            <button
              v-if="!notification.read"
              type="button"
              class="mt-1 self-start font-heading text-[13px] font-bold text-action hover:underline"
              @click="marquerLue(notification)"
            >
              Marquer comme lu
            </button>
          </div>
        </li>
      </ul>
    </main>
  </div>
</template>
