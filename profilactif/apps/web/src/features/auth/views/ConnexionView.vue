<script setup lang="ts">
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Password from 'primevue/password';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useAuth } from '@/shared/stores/auth';

const router = useRouter();
const { connecter } = useAuth();

const email = ref('');
const motDePasse = ref('');
const erreur = ref('');

/*
 * Only checks that both fields are filled — the credentials are the API's call.
 * No password-rules checklist here unlike signup: on a login form it only tells
 * an attacker what to try.
 */
function seConnecter(): void {
  erreur.value = '';

  if (email.value.trim() === '' || motDePasse.value === '') {
    erreur.value = 'Renseignez votre email et votre mot de passe.';
    return;
  }

  /*
   * Placeholder until POST /api/auth/login exists: the API will return the user
   * and their role. Change the role here to preview the other spaces.
   */
  connecter({ prenom: 'Camille', nom: 'Durand', role: 'demandeur' });
  router.push({ name: 'home' });
}
</script>

<template>
  <div class="flex justify-center px-4 py-16 sm:px-gutter">
    <form
      class="w-full max-w-120 rounded-card border border-surface-line bg-surface-page p-8"
      @submit.prevent="seConnecter"
    >
      <h1 class="text-[24px]">Connexion</h1>
      <p class="mt-2 text-[15px] text-ink-muted">Accédez à votre espace ProfilsActifs.</p>

      <!-- Message already carries role="alert" and aria-live="assertive". -->
      <Message v-if="erreur" severity="error" :closable="false" class="mt-6">
        {{ erreur }}
      </Message>

      <div class="mt-6 flex flex-col gap-1.5">
        <label for="email" class="font-heading text-[15px] font-semibold text-brand">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          required
          class="w-full"
        />
      </div>

      <div class="mt-4 flex flex-col gap-1.5">
        <label for="mot-de-passe" class="font-heading text-[15px] font-semibold text-brand">
          Mot de passe
        </label>
        <!--
          `input-props` rather than plain attributes: Password sets
          inheritAttrs to false and forwards attributes to its wrapper, not to
          the <input>, so `autocomplete` and `required` would never reach the
          field itself.
        -->
        <Password
          v-model="motDePasse"
          input-id="mot-de-passe"
          :feedback="false"
          toggle-mask
          :input-props="{ autocomplete: 'current-password', required: true }"
          class="w-full"
          input-class="w-full"
        />
      </div>

      <!-- Primary action: the action color, never the brand blue. -->
      <Button
        type="submit"
        label="Se connecter"
        class="mt-8 w-full justify-center rounded-control py-3 font-heading text-[14px] font-bold tracking-[0.75px]"
      />

      <p class="mt-6 text-center text-[15px] text-ink-muted">
        Pas encore de compte ?
        <router-link
          :to="{ name: 'signup' }"
          class="font-heading font-medium text-brand hover:underline"
        >
          Créer un compte
        </router-link>
      </p>
    </form>
  </div>
</template>
