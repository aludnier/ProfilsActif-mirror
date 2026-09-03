<script setup lang="ts">
/*
 * Témoignage figé issu de la maquette. Contenu éditorial, pas de la donnée
 * applicative : il n'a pas vocation à venir de l'API.
 */
const temoignage = {
  citation:
    "Le format vidéo a permis à notre service RH de présélectionner des candidats sur leur motivation réelle plutôt que sur la forme de leur CV papier. Une innovation inclusive majeure pour notre agence de l'eau.",
  auteur: 'Hélène Vasseur',
  fonction: "Directrice des ressources humaines, Direction régionale de l'environnement",
};
</script>

<template>
  <section
    aria-labelledby="recit-experience"
    class="flex flex-col items-center gap-8 px-gutter py-22"
  >
    <h2
      id="recit-experience"
      class="text-center font-heading text-[12px] uppercase tracking-[1px] text-action"
    >
      Récit d'expérience
    </h2>

    <!-- <figure>/<blockquote>/<figcaption> : c'est le balisage prévu pour une
         citation et son attribution. -->
    <figure class="flex flex-col items-center gap-8">
      <blockquote class="max-w-[800px] text-center text-[24px] italic leading-9 text-brand">
        <p>«&nbsp;{{ temoignage.citation }}&nbsp;»</p>
      </blockquote>

      <figcaption class="flex flex-col items-center gap-1">
        <span class="font-heading text-[16px] font-bold">{{ temoignage.auteur }}</span>
        <span class="font-heading text-[13px] text-ink-muted">{{ temoignage.fonction }}</span>
      </figcaption>
    </figure>
  </section>
</template>
