<script setup lang="ts">
import Button from 'primevue/button';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import { computed } from 'vue';

import EditeurCompetences from '@/features/profil/components/EditeurCompetences.vue';

export type InfosProfil = {
  firstName: string;
  lastName: string;
  phone: string;
  age: number | null;
  location: string;
  targetSector: string;
  employmentType: 'full_time' | 'part_time' | 'freelance' | 'internship' | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  workMode: 'on_site' | 'hybrid' | 'remote' | null;
  experienceYears: number | null;
  bio: string;
};

/*
 * The view owns the state and the save, because the mockup puts the save button
 * outside this card and because the completion bar has to count these fields.
 * This component only presents them.
 */
const infos = defineModel<InfosProfil>('infos', { required: true });
const competences = defineModel<string[]>('competences', { required: true });

defineProps<{ desactive?: boolean }>();

const initiales = computed(() =>
  `${infos.value.firstName.charAt(0)}${infos.value.lastName.charAt(0)}`.toUpperCase(),
);
</script>

<template>
  <section class="flex flex-col gap-6 rounded-card border border-surface-line bg-surface-page p-6">
    <h2 class="text-[18px]">Informations personnelles</h2>

    <div class="flex items-center gap-4">
      <!-- Initials rather than a photo: `seeker` has no avatar column and there
           is no upload endpoint, so an upload button would lead nowhere. -->
      <span
        class="flex size-14 shrink-0 items-center justify-center rounded-full bg-surface-muted font-heading text-[16px] font-bold text-brand"
        aria-hidden="true"
      >
        {{ initiales }}
      </span>
      <div class="flex flex-col gap-1">
        <Button
          label="Modifier la photo"
          severity="secondary"
          outlined
          disabled
          class="rounded-control font-heading text-[14px] font-semibold"
        />
        <p class="text-[13px] text-ink-muted">Disponible une fois l'envoi de fichiers en place.</p>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1.5">
        <label for="prenom" class="font-heading text-[15px] font-semibold text-brand">Prénom</label>
        <InputText id="prenom" v-model="infos.firstName" :disabled="desactive" class="w-full" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="nom" class="font-heading text-[15px] font-semibold text-brand">Nom</label>
        <InputText id="nom" v-model="infos.lastName" :disabled="desactive" class="w-full" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="telephone" class="font-heading text-[15px] font-semibold text-brand">
          Téléphone
        </label>
        <InputText
          id="telephone"
          v-model="infos.phone"
          type="tel"
          autocomplete="tel"
          :disabled="desactive"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="age" class="font-heading text-[15px] font-semibold text-brand">Âge</label>
        <InputNumber
          v-model="infos.age"
          input-id="age"
          :min="16"
          :max="120"
          :use-grouping="false"
          :disabled="desactive"
          fluid
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="localisation" class="font-heading text-[15px] font-semibold text-brand">
          Localisation
        </label>
        <InputText
          id="localisation"
          v-model="infos.location"
          placeholder="Nantes (44)"
          :disabled="desactive"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="secteur" class="font-heading text-[15px] font-semibold text-brand">
          Secteur ciblé
        </label>
        <InputText
          id="secteur"
          v-model="infos.targetSector"
          placeholder="Transition écologique"
          :disabled="desactive"
          class="w-full"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="type-contrat" class="font-heading text-[15px] font-semibold text-brand">
          Type de contrat
        </label>
        <select id="type-contrat" v-model="infos.employmentType" :disabled="desactive" class="w-full rounded-control border border-surface-line bg-surface-page px-3 py-2.5">
          <option :value="null">Non renseigné</option>
          <option value="full_time">Temps plein</option>
          <option value="part_time">Temps partiel</option>
          <option value="freelance">Freelance</option>
          <option value="internship">Stage / alternance</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="contrat-du" class="font-heading text-[15px] font-semibold text-brand">
          Contrat du
        </label>
        <input id="contrat-du" v-model="infos.contractStartDate" type="date" :disabled="desactive" class="w-full rounded-control border border-surface-line px-3 py-2.5">
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="contrat-au" class="font-heading text-[15px] font-semibold text-brand">
          Contrat au
        </label>
        <input id="contrat-au" v-model="infos.contractEndDate" type="date" :disabled="desactive" class="w-full rounded-control border border-surface-line px-3 py-2.5">
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="mode-travail" class="font-heading text-[15px] font-semibold text-brand">
          Modalité de travail
        </label>
        <select id="mode-travail" v-model="infos.workMode" :disabled="desactive" class="w-full rounded-control border border-surface-line bg-surface-page px-3 py-2.5">
          <option :value="null">Non renseignée</option>
          <option value="on_site">Présentiel</option>
          <option value="hybrid">Hybride</option>
          <option value="remote">Télétravail</option>
        </select>
      </div>

      <div class="flex flex-col gap-1.5">
        <label for="experience" class="font-heading text-[15px] font-semibold text-brand">
          Années d'expérience
        </label>
        <InputNumber
          v-model="infos.experienceYears"
          input-id="experience"
          :min="0"
          :max="60"
          :min-fraction-digits="0"
          :max-fraction-digits="1"
          :use-grouping="false"
          :disabled="desactive"
          fluid
        />
      </div>
    </div>

    <div class="flex flex-col gap-1.5">
      <label for="bio" class="font-heading text-[15px] font-semibold text-brand">
        À propos de mon parcours
      </label>
      <Textarea
        id="bio"
        v-model="infos.bio"
        rows="5"
        :maxlength="2000"
        placeholder="Présentez votre parcours en quelques lignes. C'est le premier texte que lira un recruteur."
        :disabled="desactive"
        class="w-full"
      />
      <p class="text-[13px] text-ink-muted">{{ infos.bio.length }} / 2000 caractères</p>
    </div>

    <EditeurCompetences v-model="competences" />
  </section>
</template>
