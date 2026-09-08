<script setup lang="ts">
import Button from 'primevue/button';
import Message from 'primevue/message';
import ProgressBar from 'primevue/progressbar';
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import BarreLateraleCandidat from '@/features/profil/components/BarreLateraleCandidat.vue';
import FormulaireProfil from '@/features/profil/components/FormulaireProfil.vue';
import type { InfosProfil } from '@/features/profil/components/FormulaireProfil.vue';
import FormulaireVideo from '@/features/profil/components/FormulaireVideo.vue';
import AuthService from '@/services/AuthService';
import ProfileService from '@/services/ProfileService';
import { useAuthStore } from '@/shared/stores/auth';
import type { Profile, UpdateProfileInput } from '@/shared/types/api';

const CRITERES_VIDEO = [
  'Qualité sonore (voix claire et audible)',
  'Cadrage correct (buste et visage centrés)',
  'Contenu neutre et non discriminatoire',
];

const authStore = useAuthStore();
const router = useRouter();

const profil = ref<Profile | null>(null);
const infos = ref<InfosProfil>({
  firstName: '',
  lastName: '',
  phone: '',
  age: null,
  location: '',
  targetSector: '',
  employmentType: null,
  workMode: null,
  experienceYears: null,
  bio: '',
});
/* Compétences chargées et enregistrées avec le profil candidat. */
const competences = ref<string[]>([]);
const competencesInitiales = ref<string[]>([]);
const aUneVideo = ref(false);

const chargement = ref(false);
const enregistrement = ref(false);
const erreur = ref('');
const succes = ref('');
const suppressionEnCours = ref(false);
const confirmationSuppressionOuverte = ref(false);

/*
 * The mockup freezes the completion at 75%. Here it is counted: the seven saved
 * fields, the video, and at least one keyword.
 */
const completion = computed(() => {
  const remplis = [
    infos.value.firstName.trim() !== '',
    infos.value.lastName.trim() !== '',
    infos.value.phone.trim() !== '',
    infos.value.age !== null,
    infos.value.location.trim() !== '',
    infos.value.targetSector.trim() !== '',
    infos.value.bio.trim() !== '',
    aUneVideo.value,
    competences.value.length > 0,
  ];

  return Math.round((remplis.filter(Boolean).length / remplis.length) * 100);
});

const competencesModifiees = computed(() =>
  JSON.stringify([...competences.value].sort()) !== JSON.stringify([...competencesInitiales.value].sort()),
);

const modifie = computed(() => {
  const source = profil.value;
  if (source === null) {
    return false;
  }

  return (
    infos.value.firstName !== source.firstName ||
    infos.value.lastName !== source.lastName ||
    infos.value.phone !== (source.phone ?? '') ||
    infos.value.age !== source.age ||
    infos.value.location !== (source.location ?? '') ||
    infos.value.targetSector !== (source.targetSector ?? '') ||
    infos.value.employmentType !== source.employmentType ||
    infos.value.workMode !== source.workMode ||
    infos.value.experienceYears !== source.experienceYears ||
    infos.value.bio !== (source.bio ?? '') ||
    competencesModifiees.value
  );
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
    appliquer(await ProfileService.getProfile(id))
    competences.value = await ProfileService.getCompetences(id)
    competencesInitiales.value = [...competences.value];
  } catch (err: any) {
    erreur.value = err.message || 'Erreur lors du chargement du profil.';
  } finally {
    chargement.value = false;
  }
}

function appliquer(source: Profile): void {
  profil.value = source;
  infos.value = {
    firstName: source.firstName,
    lastName: source.lastName,
    phone: source.phone ?? '',
    age: source.age === null ? null : Number(source.age),
    location: source.location ?? '',
    targetSector: source.targetSector ?? '',
    employmentType: source.employmentType,
    workMode: source.workMode,
    experienceYears: source.experienceYears === null ? null : Number(source.experienceYears),
    bio: source.bio ?? '',
  };
}

/* Only the changed fields are sent: PATCH /profiles/:id accepts a partial. */
function differences(source: Profile): UpdateProfileInput {
  const modifications: UpdateProfileInput = {};

  if (infos.value.firstName !== source.firstName) {
    modifications.firstName = infos.value.firstName;
  }
  if (infos.value.lastName !== source.lastName) {
    modifications.lastName = infos.value.lastName;
  }
  if (infos.value.phone !== (source.phone ?? '')) {
    modifications.phone = infos.value.phone || null;
  }
  if (infos.value.age !== source.age) {
    modifications.age = infos.value.age;
  }
  if (infos.value.location !== (source.location ?? '')) {
    modifications.location = infos.value.location;
  }
  if (infos.value.targetSector !== (source.targetSector ?? '')) {
    modifications.targetSector = infos.value.targetSector || null;
  }
  if (infos.value.employmentType !== source.employmentType) {
    modifications.employmentType = infos.value.employmentType;
  }
  if (infos.value.workMode !== source.workMode) {
    modifications.workMode = infos.value.workMode;
  }
  if (infos.value.experienceYears !== source.experienceYears) {
    modifications.experienceYears = infos.value.experienceYears;
  }
  if (infos.value.bio !== (source.bio ?? '')) {
    modifications.bio = infos.value.bio || null;
  }

  return modifications;
}

async function enregistrer(): Promise<void> {
  const source = profil.value;
  if (source === null || !modifie.value) {
    return;
  }

  enregistrement.value = true;
  erreur.value = '';
  succes.value = '';

  try {
    const misAJour = await ProfileService.updateProfile(source.id, differences(source));
    const competencesSauvegardees = await ProfileService.updateCompetences(source.id, competences.value);
    appliquer(misAJour);
    competences.value = competencesSauvegardees;
    competencesInitiales.value = [...competencesSauvegardees];
    authStore.updateUser({ firstName: misAJour.firstName, lastName: misAJour.lastName });
    succes.value = 'Profil enregistré.';
  } catch (err: any) {
    erreur.value = err.message || 'Erreur lors de la sauvegarde.';
  } finally {
    enregistrement.value = false;
  }
}

function ouvrirConfirmationSuppression(): void {
  confirmationSuppressionOuverte.value = true
}

function fermerConfirmationSuppression(): void {
  if (!suppressionEnCours.value) {
    confirmationSuppressionOuverte.value = false
  }
}

async function confirmerSuppressionCompte(): Promise<void> {
  suppressionEnCours.value = true
  erreur.value = ''
  try {
    await AuthService.deleteMe()
    authStore.logout()
    await router.push({ name: 'home' })
  } catch (err: any) {
    erreur.value = err.message || 'Impossible de supprimer votre compte.'
    confirmationSuppressionOuverte.value = false
  } finally {
    suppressionEnCours.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-stretch">
    <BarreLateraleCandidat class="hidden lg:flex" />

    <main class="flex min-w-0 flex-1 flex-col gap-8 bg-surface-subtle p-6 lg:p-10">
      <header class="flex flex-wrap items-end justify-between gap-6">
        <div class="flex flex-col gap-2">
          <h1 class="text-[28px]">Édition de mon profil professionnel</h1>
          <p class="text-[15px] text-ink-muted">
            Complétez votre dossier pour le rendre visible auprès des recruteurs certifiés.
          </p>
        </div>

        <div class="flex w-45 flex-col gap-2">
          <p class="font-heading text-[12px] font-bold uppercase tracking-[0.5px] text-action">
            Profil complété à {{ completion }} %
          </p>
          <ProgressBar
            :value="completion"
            :show-value="false"
            aria-label="Progression du remplissage du profil"
            class="h-2"
          />
        </div>
      </header>

      <Message v-if="erreur" severity="error" :closable="false">{{ erreur }}</Message>
      <Message v-if="succes" severity="success" :closable="false">{{ succes }}</Message>

      <p v-if="chargement" class="text-[15px] text-ink-muted">Chargement de votre profil…</p>

      <div v-else class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_480px]">
        <FormulaireProfil
          v-model:infos="infos"
          v-model:competences="competences"
          :desactive="enregistrement"
        />

        <div class="flex flex-col gap-6">
          <FormulaireVideo @video-presente="aUneVideo = $event" />

          <section
            class="flex flex-col gap-3 rounded-card border border-surface-line bg-surface-page p-5"
          >
            <h2 class="font-heading text-[12px] font-bold uppercase tracking-[0.5px] text-brand">
              Critères de validation du recruteur
            </h2>
            <ul class="flex flex-col gap-2">
              <li
                v-for="critere in CRITERES_VIDEO"
                :key="critere"
                class="flex items-start gap-2 text-[14px]"
              >
                <svg
                  class="mt-0.5 size-4 shrink-0 text-status-valid"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M3 8.5 6.2 11.7 13 5"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                {{ critere }}
              </li>
            </ul>
          </section>
        </div>
      </div>

      <footer
        class="flex flex-wrap items-center justify-between gap-4 border-t border-surface-line pt-6"
      >
        <!--
          The mockup has "Enregistrer le brouillon" and "Publier mon profil
          public": `app_user.status` knows nothing about drafts or moderation,
          so a single, honest button until it does.
        -->
        <p class="text-[14px] text-ink-muted">
          Vos modifications sont visibles immédiatement sur votre profil public.
        </p>
        <Button
          label="Enregistrer"
          :disabled="!modifie || enregistrement"
          class="rounded-control px-8 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
          @click="enregistrer"
        />

        <Button
          label="Supprimer définitivement mon compte"
          severity="danger"
          outlined
          :disabled="suppressionEnCours || enregistrement"
          class="rounded-control px-6 py-3 text-[14px] font-bold"
          @click="ouvrirConfirmationSuppression"
        />
      </footer>
    </main>
  </div>
  <Teleport to="body">
    <div
      v-if="confirmationSuppressionOuverte"
      class="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 p-4"
      role="presentation"
      @keydown.esc="fermerConfirmationSuppression"
    >
      <section
        class="w-full max-w-lg rounded-card border border-surface-line bg-surface-page p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-suppression-titre"
      >
        <div class="flex flex-col gap-3">
          <p class="font-heading text-[12px] font-bold uppercase tracking-[0.5px] text-status-error">
            Suppression du compte
          </p>
          <h2 id="confirmation-suppression-titre" class="text-[22px] text-brand">
            Supprimer définitivement votre compte ?
          </h2>
          <p class="text-[15px] leading-[1.6] text-ink-muted">
            Votre profil, votre vidéo, vos certifications et toutes les données associées seront supprimés.
            Cette action est irréversible.
          </p>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <Button
            label="Annuler"
            severity="secondary"
            text
            :disabled="suppressionEnCours"
            class="rounded-control px-5 py-2.5"
            @click="fermerConfirmationSuppression"
          />
          <Button
            label="Supprimer mon compte"
            severity="danger"
            :loading="suppressionEnCours"
            class="rounded-control px-5 py-2.5 font-bold"
            @click="confirmerSuppressionCompte"
          />
        </div>
      </section>
    </div>
  </Teleport>

</template>
