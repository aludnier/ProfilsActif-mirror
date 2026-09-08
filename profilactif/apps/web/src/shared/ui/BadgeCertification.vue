<script setup lang="ts">
import Tag from 'primevue/tag';
import { computed } from 'vue';

const props = defineProps<{
  level: string | null;
}>();

/*
 * Les niveaux viennent de `badgeBands` côté API. Ils décrivent un score au
 * test, jamais une ancienneté : le vocabulaire évite donc junior / confirmé /
 * senior, déjà pris par le filtre d'expérience du catalogue recruteur
 * (`CatalogueView.vue`), où « senior » veut dire 7 ans et plus. Un profil de
 * 3 ans annoncé « certifié senior » se lisait comme une contradiction.
 *
 * Les anciens noms restent reconnus : des tentatives ont été passées sous une
 * version antérieure du questionnaire, et leur badge se recalcule à
 * l'affichage.
 *
 * Couleurs prises dans les tokens, jamais dans la palette Tailwind par défaut.
 * Contrastes mesurés : avancée 8,06:1, intermédiaire 5,57:1, initiale 5,69:1,
 * non certifié 15:1.
 */
const AVANCEE = {
  libelle: 'Certification avancée',
  classe: 'bg-status-verified text-on-status-verified',
};
const INTERMEDIAIRE = {
  libelle: 'Certification intermédiaire',
  classe: 'bg-brand-50 text-brand',
};
const INITIALE = {
  libelle: 'Certification initiale',
  classe: 'bg-action-100 text-action-700',
};

const STYLES: Record<string, { libelle: string; classe: string }> = {
  avancée: AVANCEE,
  avancee: AVANCEE,
  senior: AVANCEE,
  or: AVANCEE,
  intermédiaire: INTERMEDIAIRE,
  intermediaire: INTERMEDIAIRE,
  argent: INTERMEDIAIRE,
  initiale: INITIALE,
  initial: INITIALE,
  débutant: INITIALE,
  debutant: INITIALE,
  bronze: INITIALE,
};

const style = computed(() => {
  const connu = props.level ? STYLES[props.level] : undefined;
  if (connu) return connu;

  return {
    libelle: props.level ? `Certification ${props.level}` : 'Non certifié',
    classe: 'bg-surface-muted text-ink',
  };
});
</script>

<template>
  <Tag
    rounded
    class="gap-1.5 px-3 py-1 font-heading text-[12px] font-bold uppercase tracking-wide"
    :class="style.classe"
  >
    <!-- Icône en SVG : primeicons n'est pas installé dans le projet. -->
    <svg class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fill-rule="evenodd"
        d="M10 1.5 12.6 6l5 .7-3.6 3.5.9 5L10 12.9 5.1 15.2l.9-5L2.4 6.7l5-.7L10 1.5Z"
        clip-rule="evenodd"
      />
    </svg>
    {{ style.libelle }}
  </Tag>
</template>
