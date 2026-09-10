<script setup lang="ts">
import Button from 'primevue/button';
import { computed } from 'vue';

import flecheDroite from '@/assets/icons/arrow-right.svg';
import studioVideo from '@/assets/images/hero-studio.webp';
import { useAuthStore } from '@/shared/stores/auth';
import { LIBELLES_ROLE, ROUTE_ESPACE } from '@/shared/types/roles';

const authStore = useAuthStore();

/*
 * L'appel à l'action s'adresse d'abord au visiteur. Une fois connecté,
 * l'inscription n'a plus de sens : chacun repart vers son espace, et le
 * libellé suit la destination plutôt que de promettre une création de compte.
 */
// Same target as the navbar's « Découvrir les profils » for a recruiter; a
// visitor stays on the public feed, since the catalogue is role-guarded.
const destinationProfils = computed(() => {
  const role = authStore.user?.role;

  return role === 'recruiter' || role === 'admin'
    ? { name: 'recruiter-catalog' }
    : { name: 'feed' };
});

const actionPrincipale = computed(() => {
  const compte = authStore.user;

  if (compte === null) {
    return { libelle: 'Créer mon profil vidéo', to: { name: 'signup' } };
  }

  return {
    libelle:
      compte.role === 'seeker' ? 'Compléter mon profil' : `Espace ${LIBELLES_ROLE[compte.role]}`,
    to: { name: ROUTE_ESPACE[compte.role] },
  };
});
</script>

<template>
  <section class="flex flex-wrap items-center gap-12 bg-surface-muted px-gutter py-22">
    <div class="flex min-w-0 flex-1 basis-[480px] flex-col items-start gap-8">
      <div class="flex w-full flex-col items-start gap-3">
        <h1 class="text-[48px] leading-[56px]">
          Recrutez autrement. Découvrez les talents en vidéo.
        </h1>
      </div>

      <p class="text-[18px] leading-[1.6]">
        Compétences+ humanise la mise en relation entre candidats et recruteurs au sein de
        l'écosystème de l'emploi français. Les candidats s'expriment en 90 secondes sur leur
        parcours, au-delà du CV papier.
      </p>

      <div class="flex items-start gap-4">
        <Button
          as="router-link"
          :to="actionPrincipale.to"
          class="gap-2 rounded-control px-7 py-4 font-heading text-[16px] font-bold"
        >
          {{ actionPrincipale.libelle }}
          <img :src="flecheDroite" alt="" class="size-5" />
        </Button>

        <Button
          as="router-link"
          :to="destinationProfils"
          class="rounded-control border-2 border-brand bg-transparent px-7 py-4 font-heading text-[16px] font-bold text-brand hover:bg-brand-50"
        >
          Les Profils
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
