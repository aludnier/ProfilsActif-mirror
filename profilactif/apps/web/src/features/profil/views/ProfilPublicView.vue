<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import Tag from 'primevue/tag';
import { computed, ref, watch } from 'vue';

import BarreLateraleCandidat from '@/features/profil/components/BarreLateraleCandidat.vue';
import ProfileService from '@/services/ProfileService';
import VideoService from '@/services/VideoService';
import BadgeCertification from '@/shared/ui/BadgeCertification.vue';
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue';
import { estCertifie, niveauBadge } from '@/shared/certification';
import { photoValidee, urlPhotoProfil } from '@/shared/photoProfil';
import { useAuthStore } from '@/shared/stores/auth';
import type { Profile } from '@/shared/types/api';
import { extraireIdYouTube } from '@/shared/youtube';

const authStore = useAuthStore();

const profil = ref<Profile | null>(null);
const idVideo = ref<string | null>(null);
const profilVideoEnLigne = ref(false);
const competences = ref<string[]>([]);
const chargement = ref(false);
const erreur = ref('');
const profilIndisponible = ref(false);

const initiales = computed(() => {
  const source = profil.value;
  if (source === null) {
    return '';
  }

  return `${source.firstName.charAt(0)}${source.lastName.charAt(0)}`.toUpperCase();
});

const details = computed(() => {
  const source = profil.value;
  if (source === null) {
    return [];
  }

  return [
    { libelle: 'Localisation', valeur: source.location },
    { libelle: 'Secteur ciblé', valeur: source.targetSector },
    { libelle: 'Type de contrat', valeur: source.employmentType },
    { libelle: 'Modalité de travail', valeur: source.workMode },
    { libelle: "Années d'expérience", valeur: source.experienceYears === null ? null : String(source.experienceYears) + ' ans' },
    { libelle: 'Email', valeur: source.mail },
    { libelle: 'Téléphone', valeur: source.phone },
  ].filter((detail) => detail.valeur !== null && detail.valeur !== '');
});

watch(
  () => authStore.user?.id,
  (id) => {
    if (id !== undefined) {
      charger(id);
    }
  },
  { immediate: true },
);

async function charger(id: string): Promise<void> {
  chargement.value = true;
  erreur.value = '';

  try {
    profil.value = await ProfileService.getProfile(id);
    competences.value = await ProfileService.getCompetences(id);

    const videos = await VideoService.getVideosBySeeker(id);
    idVideo.value = videos[0] === undefined ? null : extraireIdYouTube(videos[0].url);
    profilVideoEnLigne.value = videos[0]?.status === 'approved';
  } catch (err: any) {
    erreur.value = err.message || 'Impossible de charger votre profil.';
  } finally {
    chargement.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-stretch">
    <BarreLateraleCandidat class="hidden lg:flex" />

    <main class="flex min-w-0 flex-1 flex-col gap-6 bg-surface-subtle p-6 lg:p-10">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-col gap-1">
          <h1 class="text-[28px]">Mon profil public</h1>
          <p class="text-[15px] text-ink-muted">
            Voici votre fiche telle que la voient les recruteurs.
          </p>
        </div>
        <Button
          label="Modifier mon profil"
          severity="secondary"
          outlined
          class="rounded-control font-heading text-[14px] font-semibold"
          @click="$router.push({ name: 'candidate-dashboard' })"
        />
      </div>

      <Message v-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>

      <section v-if="profilIndisponible" class="rounded-card border border-surface-line bg-surface-page p-8 text-center">
        <h1 class="text-[24px] text-brand">Profil indisponible</h1>
        <p class="mt-3 text-[15px] text-ink-muted">Ce profil n’est plus disponible dans le catalogue.</p>
      </section>

      <p v-if="chargement" class="text-[15px] text-ink-muted">Chargement…</p>

      <template v-else-if="profil !== null">
        <section
          class="flex flex-wrap items-center gap-5 rounded-card border border-surface-line bg-surface-page p-6"
        >
          <!-- Photo seulement si elle est validée : c'est la vue publique. -->
          <img
            v-if="photoValidee(profil.photoStatus)"
            :src="urlPhotoProfil(profil.id)"
            :alt="`Photo de ${profil.firstName} ${profil.lastName}`"
            class="size-16 shrink-0 rounded-full object-cover"
          />
          <span
            v-else
            class="flex size-16 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-[20px] font-bold text-brand"
            aria-hidden="true"
          >
            {{ initiales }}
          </span>

          <div class="flex min-w-0 flex-col items-start gap-1.5">
            <h2 class="text-[22px]">{{ profil.firstName }} {{ profil.lastName }}</h2>
            <p v-if="profil.targetSector" class="text-[15px] text-ink-muted">
              {{ profil.targetSector }}
            </p>
            <BadgeCertification
              v-if="estCertifie(profil.certificationRate)"
              :level="niveauBadge(profil.certificationRate)"
            />
          </div>

          <Tag
            v-if="idVideo !== null"
            :value="profilVideoEnLigne ? 'Vidéo en ligne' : 'Vidéo en attente de validation'"
            class="ml-auto rounded-badge bg-surface-muted px-3 py-1.5 font-heading text-[12px] font-medium text-brand"
          />
        </section>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_480px]">
          <div class="flex flex-col gap-6">
            <section
              v-if="profil.bio"
              class="flex flex-col gap-3 rounded-card border border-surface-line bg-surface-page p-6"
            >
              <h2 class="text-[18px]">À propos de mon parcours</h2>
              <p class="whitespace-pre-line text-[15px] leading-[1.7]">{{ profil.bio }}</p>
            </section>

            <section
              v-if="competences.length"
              class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-6"
            >
              <h2 class="text-[18px]">Compétences clés</h2>
              <ul class="flex flex-wrap gap-2">
                <li
                  v-for="competence in competences"
                  :key="competence"
                  class="rounded-badge bg-surface-muted px-3 py-1.5 font-heading text-[12px] font-medium text-brand"
                >
                  {{ competence }}
                </li>
              </ul>
            </section>

            <section
              class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-6"
            >
              <h2 class="text-[18px]">Informations</h2>
              <dl class="grid gap-3 sm:grid-cols-2">
                <div v-for="detail in details" :key="detail.libelle" class="flex flex-col gap-0.5">
                  <dt class="font-heading text-[12px] uppercase tracking-[0.5px] text-ink-muted">
                    {{ detail.libelle }}
                  </dt>
                  <dd class="text-[15px]">{{ detail.valeur }}</dd>
                </div>
              </dl>
            </section>
          </div>

          <section
            class="flex flex-col gap-4 rounded-card border border-surface-line bg-surface-page p-5"
          >
            <h2 class="text-[18px]">Ma vidéo de présentation</h2>

            <LecteurYouTube
              v-if="idVideo !== null"
              :id-you-tube="idVideo"
              titre="Ma vidéo de présentation"
            />
            <p v-else class="text-[14px] text-ink-muted">
              Aucune vidéo publiée. C'est le premier élément que regarde un recruteur.
            </p>
          </section>
        </div>
      </template>
    </main>
  </div>
</template>
