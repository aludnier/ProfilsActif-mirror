<script setup lang="ts">
import Button from 'primevue/button';

import flecheDroite from '@/assets/icons/arrow-right.svg';
import studioVideo from '@/assets/images/hero-studio.webp';
</script>

<template>
  <!--
    La maquette n'existe qu'en 1440px. `flex-wrap` évite seulement le
    débordement horizontal en dessous : ce n'est pas une mise en page mobile,
    qui reste à cadrer avec le design.
  -->
  <section class="flex flex-wrap items-center gap-12 bg-surface-muted px-gutter py-22">
    <div class="flex min-w-0 flex-1 basis-[480px] flex-col items-start gap-8">
      <div class="flex w-full flex-col items-start gap-3">
        <p
          class="rounded-badge border border-brand bg-surface-page px-3 py-1.5 font-heading text-[12px] font-bold uppercase text-brand"
        >
          Dispositif porté par l'État
        </p>

        <h1 class="text-[48px] leading-[56px]">
          Recrutez autrement. Découvrez les talents en vidéo.
        </h1>
      </div>

      <p class="text-[18px] leading-[1.6]">
        ProfilsActifs humanise la mise en relation entre candidats et recruteurs au sein de
        l'écosystème de l'emploi français. Les candidats s'expriment en 90 secondes sur leur
        parcours, au-delà du CV papier.
      </p>

      <div class="flex items-start gap-4">
        <!--
          Action primaire : le fond vient de la palette `primary` de PrimeVue,
          branchée sur la couleur d'action dans app/plugins/primevue.ts. Rien
          n'est surchargé ici — c'est le token qui fait le rendu.
        -->
        <Button
          as="router-link"
          :to="{ name: 'signup' }"
          class="gap-2 rounded-control px-7 py-4 font-heading text-[16px] font-bold"
        >
          Créer mon profil vidéo
          <img :src="flecheDroite" alt="" class="size-5" />
        </Button>

        <!--
          Action secondaire : contour bleu institutionnel, jamais en aplat.
          Même destination que « Découvrir les profils » du header : deux
          libellés identiques doivent mener au même endroit.
        -->
        <Button
          as="router-link"
          :to="{ name: 'recruiter-catalog' }"
          class="rounded-control border-2 border-brand bg-transparent px-7 py-4 font-heading text-[16px] font-bold text-brand hover:bg-brand-50"
        >
          Découvrir les profils
        </Button>
      </div>
    </div>

    <div class="flex min-w-0 flex-1 basis-[520px] items-start justify-center">
      <img
        :src="studioVideo"
        alt="Un studio d'enregistrement vidéo : caméra sur trépied, fauteuil et éclairages."
        class="h-[390px] w-full max-w-[520px] rounded-media object-cover"
      />
    </div>
  </section>
</template>
