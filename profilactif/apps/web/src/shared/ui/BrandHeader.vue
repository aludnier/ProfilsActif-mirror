<script setup lang="ts">
import Button from 'primevue/button';
import Toolbar from 'primevue/toolbar';
import { useRoute } from 'vue-router';
import type { RouteLocationNamedRaw } from 'vue-router';

type LienNav = {
  libelle: string;
  to?: RouteLocationNamedRaw;
};

/*
 * Les trois derniers libellés viennent de la maquette mais n'ont pas encore de
 * vue : ils sont rendus en texte inerte tant que la route n'existe pas, plutôt
 * qu'en lien mort.
 */
const liensNav: LienNav[] = [
  /*
   * Pointe sur le catalogue et non sur `profiles` : le feed public
   * (features/profil/views/FeedView.vue) n'est encore qu'un stub vide, alors
   * que le catalogue affiche réellement des profils. À rebasculer sur
   * `profiles` quand le feed existera — les deux vues sont distinctes dans
   * docs/README.md, le feed étant public et le catalogue réservé au recruteur.
   */
  { libelle: 'Découvrir les profils', to: { name: 'recruiter-catalog' } },
  { libelle: 'Comment ça marche' },
  { libelle: 'Institutionnel' },
  { libelle: 'Aide' },
];

const route = useRoute();

function estActif(lien: LienNav): boolean {
  return lien.to !== undefined && route.name === lien.to.name;
}
</script>

<template>
  <header>
    <!--
      Le padding interne du Toolbar tient lieu de zone de protection du
      bloc-marque (règle de marque, cf. CLAUDE.md) : la marge minimale autour du
      logo est portée par le token du composant, pas par une marge codée à la main.
      `role` est neutralisé car la sémantique de repère vient du <header> et du <nav>.
    -->
    <Toolbar
      class="h-header rounded-none border-0 border-b border-surface-line"
      :dt="{
        background: 'var(--color-surface-page)',
        borderColor: 'var(--color-surface-line)',
        borderRadius: '0',
        padding: '0 var(--spacing-gutter)',
      }"
      :pt="{ root: { role: undefined } }"
    >
      <template #start>
        <!--
          Le bloc-marque entier ramène à l'accueil. C'est un lien et non un
          bouton : l'action est une navigation. `aria-label` remplace le
          libellé qu'un lecteur d'écran énoncerait sinon en trois morceaux
          (« République Française ProfilsActifs Service public numérique »).
        -->
        <router-link
          :to="{ name: 'home' }"
          :aria-current="route.name === 'home' ? 'page' : undefined"
          aria-label="ProfilsActifs, retour à l'accueil"
          class="-mx-2 flex items-center gap-4 rounded-control px-2 py-1 hover:bg-surface-subtle"
        >
          <!--
            La maquette fixe ce bloc à 44px de large alors que le libellé y
            déborde (Figma : texte de 51px posé à x=-3.5). On laisse donc le
            bloc s'ajuster à son texte, sinon le blanc dépasse sur le fond blanc.
          -->
          <div
            class="flex h-[54px] min-w-[44px] flex-col items-center gap-0.5 bg-brand px-1 py-1.5 font-heading text-[8px] font-bold uppercase leading-none text-on-brand"
          >
            <span class="h-1 w-8 bg-on-brand" aria-hidden="true" />
            <span class="mb-0.5 h-5 w-8 bg-on-brand" aria-hidden="true" />
            <span>République</span>
            <span>Française</span>
          </div>

          <span class="h-10 w-px bg-surface-line" aria-hidden="true" />

          <div class="flex flex-col gap-0.5 font-heading">
            <span class="text-[18px] font-bold tracking-[-0.5px] text-brand">ProfilsActifs</span>
            <span class="text-[10px] font-medium uppercase tracking-[0.5px] text-ink-muted">
              Service public numérique
            </span>
          </div>
        </router-link>
      </template>

      <template #center>
        <nav aria-label="Navigation principale">
          <ul class="flex items-center gap-8 font-heading text-[14px]">
            <li v-for="lien in liensNav" :key="lien.libelle">
              <router-link
                v-if="lien.to"
                :to="lien.to"
                :class="estActif(lien) ? 'font-medium text-brand' : 'text-ink hover:text-brand'"
                :aria-current="estActif(lien) ? 'page' : undefined"
              >
                {{ lien.libelle }}
              </router-link>
              <span v-else class="text-ink-muted">{{ lien.libelle }}</span>
            </li>
          </ul>
        </nav>
      </template>

      <template #end>
        <div class="flex items-center gap-3">
          <!--
            Ajouts hors maquette : elle ne montre qu'« Espace Recruteur », or
            sans ces deux entrées les pages de connexion et d'inscription ne
            sont atteignables qu'en tapant l'URL à la main.
          -->
          <router-link
            :to="{ name: 'login' }"
            class="font-heading text-[14px] font-medium text-ink hover:text-brand"
          >
            Se connecter
          </router-link>

          <!--
            Renvoie vers la connexion, pas vers l'annuaire : « Espace
            Recruteur » est un espace de compte (favoris, prises de contact,
            tableau de bord), il suppose d'être identifié. Y accéder
            directement laisserait un visiteur anonyme dans une zone réservée.
            À faire pointer vers le tableau de bord recruteur une fois
            l'authentification en place.

            Pastille à fond clair + texte bleu : le bleu institutionnel est
            interdit en fond de bouton, et la couleur d'action reste réservée aux
            actions primaires (créer un profil), pas à une entrée de navigation.
          -->
          <Button
            as="router-link"
            :to="{ name: 'login' }"
            label="Espace Recruteur"
            class="rounded-control border-0 bg-brand-50 px-4 py-3 font-heading text-[14px] font-medium tracking-[0.75px] text-brand hover:bg-brand-100"
          />

          <!-- Action primaire : seule entrée du header sur la couleur d'action. -->
          <Button
            as="router-link"
            :to="{ name: 'signup' }"
            label="Créer un compte"
            class="rounded-control px-4 py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
          />
        </div>
      </template>
    </Toolbar>
  </header>
</template>
