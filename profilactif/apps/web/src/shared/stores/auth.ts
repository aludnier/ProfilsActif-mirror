import { computed, reactive } from 'vue';

import type { Role } from '@/shared/types/roles';

export type Utilisateur = {
  prenom: string;
  nom: string;
  role: Role;
};

/*
 * Plain reactive object rather than a Pinia store: Pinia isn't installed, and
 * only this file changes the day it is.
 *
 * State is lost on reload — persistence comes with the real token.
 */
const etat = reactive<{ utilisateur: Utilisateur | null }>({ utilisateur: null });

export function useAuth() {
  return {
    utilisateur: computed(() => etat.utilisateur),
    estConnecte: computed(() => etat.utilisateur !== null),

    connecter(utilisateur: Utilisateur): void {
      etat.utilisateur = utilisateur;
    },

    deconnecter(): void {
      etat.utilisateur = null;
    },
  };
}
