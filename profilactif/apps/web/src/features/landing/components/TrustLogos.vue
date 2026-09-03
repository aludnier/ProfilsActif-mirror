<script setup lang="ts">
/*
 * La maquette annonçait « CONFORME RGPD & RGAA ». La mention RGAA a été
 * retirée : le pied de page déclare l'accessibilité non conforme faute
 * d'audit, les deux se seraient contredits sur la même page.
 *
 * Ces quatre organismes sont rendus en texte, comme dans la maquette : il n'y
 * a pas de fichier de logo à intégrer.
 */
const mentionHebergement = 'Hébergé souverainement en France — conforme RGPD';

const organismes = ['Ministère du Travail', 'France Travail', 'DINUM', 'ANSSI sécurisé'];
</script>

<template>
  <section class="flex flex-col items-center gap-6 border-t border-surface-line px-gutter py-12">
    <p
      class="text-center font-heading text-[11px] font-bold uppercase tracking-[1.5px] text-ink-muted"
    >
      {{ mentionHebergement }}
    </p>

    <ul class="flex flex-wrap items-center justify-center gap-12">
      <li
        v-for="organisme in organismes"
        :key="organisme"
        class="font-heading text-[16px] font-bold uppercase text-ink-muted"
      >
        {{ organisme }}
      </li>
    </ul>
  </section>
</template>
