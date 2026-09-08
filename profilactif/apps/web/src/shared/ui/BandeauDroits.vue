<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

/*
 * Formulation exacte et obligatoire : ne pas réécrire, ni abréger, ni couper.
 * Gardée dans une constante plutôt qu'écrite dans le gabarit, sinon le
 * retour à la ligne du formatage se retrouverait dans le texte du DOM.
 */
const MENTION_DROITS =
  "Aucune donnée de ce service n'est utilisée pour déterminer vos droits ni le montant de vos allocations.";

const route = useRoute();

/*
 * Masqué dans les espaces recruteur et admin : la phrase parle des droits de
 * la personne qui la lit. La règle se lit sur le routeur plutôt que sur une
 * liste de chemins — une route réservée à un rôle autre que `seeker` n'est pas
 * un écran candidat. Les routes publiques (connexion, erreurs) n'ont pas de
 * `meta.roles` et affichent donc le bandeau.
 */
const visible = computed(() => {
  const roles = route.meta.roles;

  return roles === undefined || roles.includes('seeker');
});
</script>

<template>
  <p
    v-if="visible"
    role="note"
    class="sticky top-0 z-40 bg-brand px-4 py-3 text-center font-heading text-[16px] font-bold leading-snug text-on-brand sm:px-gutter"
  >
    {{ MENTION_DROITS }}
  </p>
</template>
