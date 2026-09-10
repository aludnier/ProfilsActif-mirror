<script setup lang="ts">
import Checkbox from 'primevue/checkbox'
import RadioButton from 'primevue/radiobutton'

const niveau = defineModel<string>('niveau', { required: true })
const types = defineModel<string[]>('types', { required: true })
const modalites = defineModel<string[]>('modalites', { required: true })
const secteur = defineModel<string>('secteur', { required: true })
const localisation = defineModel<string>('localisation', { required: true })
const competence = defineModel<string>('competence', { required: true })
const contratDu = defineModel<string>('contratDu', { required: true })
const contratAu = defineModel<string>('contratAu', { required: true })
const certification = defineModel<string>('certification', { required: true })

const niveaux = [
  { value: 'all', label: 'Tous niveaux' },
  { value: 'junior', label: 'Junior (0 - 2 ans)' },
  { value: 'confirmed', label: 'Confirme (2 - 7 ans)' },
  { value: 'senior', label: 'Senior (7 ans et +)' },
]
const typesContrat = [
  { value: 'full_time', label: 'Temps plein' },
  { value: 'part_time', label: 'Temps partiel' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Stage / alternance' },
]
const modesTravail = [
  { value: 'on_site', label: 'Presentiel' },
  { value: 'hybrid', label: 'Hybride' },
  { value: 'remote', label: 'Teletravail' },
]
</script>

<template>
  <aside class="flex w-[280px] shrink-0 flex-col items-start gap-6 border-r border-surface-line bg-surface-page p-6">
    <div class="flex w-full flex-col items-start gap-3">
      <h2 class="font-heading text-[12px] uppercase tracking-[0.5px] text-ink-muted">Filtres avances</h2>
      <span class="h-px w-full bg-surface-line" aria-hidden="true" />
    </div>


    <fieldset class="flex w-full flex-col gap-3">
      <legend class="mb-1 font-heading text-[14px] font-bold text-brand">Recherche ciblée</legend>
      <label for="filtre-competence" class="font-heading text-[13px] text-ink-muted">Compétence</label>
      <input id="filtre-competence" v-model="competence" type="search" class="w-full rounded-control border border-surface-line px-3 py-2 text-[14px]" placeholder="Ex. React, gestion...">
      <label for="filtre-secteur" class="font-heading text-[13px] text-ink-muted">Secteur</label>
      <input id="filtre-secteur" v-model="secteur" type="search" class="w-full rounded-control border border-surface-line px-3 py-2 text-[14px]" placeholder="Ex. Numérique">
      <label for="filtre-localisation" class="font-heading text-[13px] text-ink-muted">Localisation</label>
      <input id="filtre-localisation" v-model="localisation" type="search" class="w-full rounded-control border border-surface-line px-3 py-2 text-[14px]" placeholder="Ex. Paris">
    </fieldset>

    <fieldset class="flex w-full flex-col gap-3">
      <legend class="mb-1 font-heading text-[14px] font-bold text-brand">Statut de certification</legend>
      <select v-model="certification" class="w-full rounded-control border border-surface-line bg-surface-page px-3 py-2 text-[14px]" aria-label="Statut de certification">
        <option value="">Tous les statuts</option>
        <option value="certifiee">Certifiée</option>
        <option value="non_certifiee">Non certifiée</option>
      </select>
    </fieldset>

    <fieldset class="flex w-full flex-col gap-3">
      <legend class="mb-1 font-heading text-[14px] font-bold text-brand">Durée du contrat</legend>
      <label for="filtre-contrat-du" class="font-heading text-[13px] text-ink-muted">Du</label>
      <input id="filtre-contrat-du" v-model="contratDu" type="date" class="w-full rounded-control border border-surface-line px-3 py-2 text-[14px]">
      <label for="filtre-contrat-au" class="font-heading text-[13px] text-ink-muted">Au</label>
      <input id="filtre-contrat-au" v-model="contratAu" type="date" class="w-full rounded-control border border-surface-line px-3 py-2 text-[14px]">
    </fieldset>

    <fieldset class="flex w-full flex-col items-start gap-3">
      <legend class="mb-3 font-heading text-[14px] font-bold text-brand">Niveau d'experience</legend>
      <div v-for="option in niveaux" :key="option.value" class="flex items-center gap-2">
        <RadioButton v-model="niveau" :input-id="option.value" name="niveau" :value="option.value" />
        <label :for="option.value" class="cursor-pointer font-heading text-[14px]">{{ option.label }}</label>
      </div>
    </fieldset>

    <fieldset class="flex w-full flex-col items-start gap-3">
      <legend class="mb-3 font-heading text-[14px] font-bold text-brand">Type de contrat</legend>
      <div v-for="option in typesContrat" :key="option.value" class="flex items-center gap-2">
        <Checkbox v-model="types" :input-id="option.value" :value="option.value" />
        <label :for="option.value" class="cursor-pointer font-heading text-[14px]">{{ option.label }}</label>
      </div>
    </fieldset>

    <fieldset class="flex w-full flex-col items-start gap-3">
      <legend class="mb-3 font-heading text-[14px] font-bold text-brand">Modalite de travail</legend>
      <div v-for="option in modesTravail" :key="option.value" class="flex items-center gap-2">
        <Checkbox v-model="modalites" :input-id="option.value" :value="option.value" />
        <label :for="option.value" class="cursor-pointer font-heading text-[14px]">{{ option.label }}</label>
      </div>
    </fieldset>
  </aside>
</template>
