<script setup lang="ts">
import type { RouteLocationNamedRaw } from 'vue-router';

type LienPied = {
  libelle: string;
  to?: RouteLocationNamedRaw;
};

type ColonnePied = {
  titre: string;
  liens: LienPied[];
};

const colonnes: ColonnePied[] = [
  {
    titre: 'Candidats',
    liens: [
      { libelle: 'Créer mon profil vidéo', to: { name: 'signup' } },
      { libelle: 'Guide de tournage' },
      { libelle: 'Protection des données' },
    ],
  },
  {
    titre: 'Recruteurs',
    liens: [
      // Same reason as "Espace Recruteur" in the header: accessing the
      // database requires a recruiter account, so this goes through login.
      { libelle: 'Accéder à la base', to: { name: 'login' } },
      { libelle: "Charte d'éthique" },
      { libelle: 'Partenariats publics' },
    ],
  },
];

/*
 * The accessibility notice is a legally-binding RGAA declaration: it must
 * reflect the level actually verified. The mockup claims "fully compliant",
 * but no audit has been carried out — so the default level is shown instead.
 * Move it to "partially compliant" then "fully compliant" only once an audit
 * justifies it, never before
 */
const liensLegaux: LienPied[] = [
  { libelle: 'Mentions légales' },
  { libelle: 'Accessibilité : non conforme' },
  { libelle: 'Données personnelles' },
];

const annee = new Date().getFullYear();
</script>

<template>
  <footer class="flex flex-col items-start gap-10 bg-brand px-gutter pb-12 pt-16">
    <div class="flex w-full flex-wrap items-start justify-between gap-10">
      <div class="flex w-[400px] max-w-full flex-col gap-4">
        <p class="font-heading text-[24px] font-bold text-on-brand">ProfilsActifs</p>
        <p class="text-[15px] leading-[1.6] text-ink-invert">
          Le profil vidéo pour humaniser le premier contact entre candidats et recruteurs, sans
          photo de CV ni tri automatisé.
        </p>
      </div>

      <nav aria-label="Liens de bas de page" class="flex flex-wrap items-start gap-16">
        <div v-for="colonne in colonnes" :key="colonne.titre" class="flex flex-col gap-3">
          <h2 class="font-heading text-[12px] font-bold uppercase tracking-[1px] text-on-brand">
            {{ colonne.titre }}
          </h2>
          <ul class="flex flex-col gap-3 text-[14px] text-ink-invert">
            <li v-for="lien in colonne.liens" :key="lien.libelle">
              <router-link v-if="lien.to" :to="lien.to" class="hover:underline">
                {{ lien.libelle }}
              </router-link>
              <span v-else>{{ lien.libelle }}</span>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <span class="h-px w-full bg-ink-invert/20" aria-hidden="true" />

    <!-- Mention obligatoire, formulation exacte : ne pas reecrire ni abreger. -->
    <p
      role="note"
      class="w-full rounded-control border border-ink-invert/30 px-4 py-3 font-heading text-[13px] font-bold text-on-brand"
    >
      Démonstrateur technique, ne constitue pas un service public en exploitation.
    </p>

    <div
      class="flex w-full flex-wrap items-start justify-between gap-4 font-heading text-[12px] text-ink-invert"
    >
      <p>© {{ annee }} ProfilsActifs. Démonstrateur technique, ne constitue pas un service public en exploitation.</p>
      <ul class="flex flex-wrap items-start gap-6">
        <li v-for="lien in liensLegaux" :key="lien.libelle">
          <router-link v-if="lien.to" :to="lien.to" class="hover:underline">
            {{ lien.libelle }}
          </router-link>
          <span v-else>{{ lien.libelle }}</span>
        </li>
      </ul>
    </div>
  </footer>
</template>
