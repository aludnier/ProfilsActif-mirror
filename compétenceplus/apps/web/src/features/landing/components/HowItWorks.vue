<script setup lang="ts">
const etapes = [
  {
    titre: 'Enregistrez votre vidéo',
    description:
      'Suivez notre guide interactif directement depuis votre smartphone ou ordinateur. Présentez votre projet professionnel de façon concise et efficace.',
  },
  {
    titre: 'Modération publique',
    description:
      "Nos conseillers s'assurent du respect de la charte de déontologie, de la qualité sonore et de la protection de vos données personnelles sous 24h.",
  },
  {
    titre: 'Accès direct recruteurs',
    description:
      "Votre profil rejoint l'annuaire. Les recruteurs vous contactent directement pour un entretien approfondi sans discrimination de CV.",
  },
];
</script>

<template>
  <section
    aria-labelledby="comment-ca-marche"
    class="flex flex-col items-start gap-14 px-gutter py-22"
  >
    <div class="flex w-full flex-col items-start gap-4">
      <p class="font-heading text-[12px] font-bold uppercase tracking-[1px] text-action">
        Processus sécurisé
      </p>
      <h2 id="comment-ca-marche" class="text-[32px]">Comment fonctionne le service ?</h2>
    </div>

    <ol class="flex w-full list-none flex-wrap gap-8">
      <li
        v-for="(etape, index) in etapes"
        :key="etape.titre"
        class="flex min-w-[280px] flex-1 flex-col items-start gap-5 rounded-card bg-surface-subtle p-6"
      >
        <p
          class="flex size-12 items-center justify-center rounded-full bg-brand font-heading text-[20px] font-bold text-on-brand"
        >
          {{ index + 1 }}
        </p>
        <h3 class="text-[18px]">{{ etape.titre }}</h3>
        <p class="text-[15px] leading-[1.6]">{{ etape.description }}</p>
      </li>
    </ol>
  </section>
</template>
