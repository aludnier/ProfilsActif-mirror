<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/shared/stores/auth'
import type { SignupInput } from '@/shared/types/api'
import { LIBELLES_ROLE, ROLES_INSCRIPTION } from '@/shared/types/roles'
import type { RoleInscription } from '@/shared/types/roles'

const router = useRouter()
const authStore = useAuthStore()

const AGE_MINIMUM = 16

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const birthday = ref<string | null>(null)
const status = ref<RoleInscription | ''>('')
const cgu = ref(false)
const location = ref('')
const sector = ref('')
const tempSkill = ref('')
const skills = ref<string[]>([])

const character = /[\s`!@#$%^&*()_+\-=\[\]{};:"|,./<>?~]/

const isPasswordValid = computed(() => {
  return (
    password.value.length >= 8 &&
    /[0-9]/.test(password.value) &&
    /[A-Z]/.test(password.value) &&
    character.test(password.value)
  )
})

function addSkill() {
  if (tempSkill.value !== '') {
    skills.value.push(tempSkill.value)
    tempSkill.value = ''
  }
}

function removeSkill(index: number) {
  skills.value.splice(index, 1)
}

const calculateAge = computed(() => {
  if (!birthday.value) return null

  const dob = new Date(birthday.value)
  const today = new Date()

  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age
})

const passwordError = ref(false)
const ageError = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function verifySubmit(event: Event) {
  event.preventDefault()

  passwordError.value = false
  ageError.value = false
  errorMessage.value = ''

  if (!isPasswordValid.value || password.value !== confirmPassword.value) {
    passwordError.value = true
    return
  }

  if (calculateAge.value === null || calculateAge.value < AGE_MINIMUM) {
    ageError.value = true
    return
  }

  if (!cgu.value) {
    errorMessage.value = 'Veuillez accepter les conditions d\'utilisation'
    return
  }

  if (!status.value) {
    errorMessage.value = 'Veuillez choisir un statut'
    return
  }

  try {
    isSubmitting.value = true

    const signupData: SignupInput = {
      firstName: firstName.value,
      lastName: lastName.value,
      mail: email.value,
      phone: '', // Sera ajouté si nécessaire
      password: password.value,
      role: status.value,
      ...(status.value === 'seeker' && {
        location: location.value,
        targetSector: sector.value,
      }),
    }

    await authStore.signup(signupData)
    router.push(
      status.value === 'recruiter' ? { name: 'recruiter-catalog' } : { name: 'candidate-dashboard' },
    )
  } catch (err: any) {
    errorMessage.value = err.message || 'Erreur lors de l\'inscription'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form @submit="verifySubmit">
    <h1>Inscription</h1>
    
    <div v-if="errorMessage" style="color: red; margin-bottom: 16px;">
      {{ errorMessage }}
    </div>

    <label for="firstName">Prenom</label><br />
    <input id="firstName" v-model="firstName" required /><br />

    <label for="lastName">Nom</label><br />
    <input id="lastName" v-model="lastName" required /><br />

    <label for="email">Email</label><br />
    <input id="email" v-model="email" required /><br />

    <label for="password">Mot de passe</label><br />
    <input
      id="password"
      v-model="password"
      type="password"
      :class="{ 'champ-invalide': passwordError }"
      required
    /><br />

    <div v-if="password.length == 0 || !isPasswordValid">
      <p>le mot de passe doit contenir :</p>
      <ul>
        <li :class="password.length < 8 ? 'invalide' : 'valide'">au moins 8 caractères</li>
        <li :class="!/[0-9]/.test(password) ? 'invalide' : 'valide'">au moins 1 chiffre</li>
        <li :class="!/[A-Z]/.test(password) ? 'invalide' : 'valide'">au moins 1 majuscule</li>
        <li :class="!character.test(password) ? 'invalide' : 'valide'">
          au moins 1 caractère spécial
        </li>
      </ul>
    </div>

    <label for="passwordConfirm">Confirmation du mot de passe</label><br />
    <input
      id="passwordConfirm"
      v-model="confirmPassword"
      :class="{ 'champ-invalide': passwordError }"
      type="password"
      required
    /><br />

    <label for="birthday">Date de naissance</label><br />
    <input
      id="birthday"
      v-model="birthday"
      :class="{ 'champ-invalide': ageError }"
      type="date"
      required
    /><br />
    <p v-if="calculateAge !== null && calculateAge < AGE_MINIMUM" class="invalide">
      date de naissance invalide
    </p>

    <label for="status">Statut</label><br />
    <select id="status" v-model="status">
      <option value="">-- choisir un statut --</option>
      <option v-for="role in ROLES_INSCRIPTION" :key="role" :value="role">
        {{ LIBELLES_ROLE[role] }}
      </option>
    </select>
    <br />

    <div v-if="status === 'seeker'">
      <label for="location">Ville</label><br />
      <input id="location" v-model="location" required /><br />

      <label for="sector">Secteur de recherche</label><br />
      <input id="sector" v-model="sector" /><br />

      <label for="skills">Compétences</label><br />
      <input id="skills" v-model="tempSkill" @keydown.enter.prevent="addSkill" /><br />

      <div class="skills-list">
        <span v-for="(skill, index) in skills" :key="index" class="skill-tag">
          {{ skill }}
          <button type="button" class="skill-remove" @click="removeSkill(index)">✕</button>
        </span>
      </div>
    </div>
    <div>
      <input id="cgu" v-model="cgu" type="checkbox" required />
      <label for="cgu">Accepter les conditions d'utilisation</label>
    </div>

    <button type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Création en cours...' : 'Créer le compte' }}
    </button>
  </form>
</template>

<style scoped>
form {
  --navy: var(--color-brand);
  --navy-light: var(--color-brand);
  --accent: var(--color-action);
  --accent-hover: var(--color-action-600);
  --bg: var(--color-surface-subtle);
  --text: var(--color-brand);
  --anneau-focus: color-mix(in srgb, var(--color-brand) 12%, transparent);

  max-width: 480px;
  margin: 40px auto;
  padding: 32px;
  background: var(--color-surface-page);
  border-radius: 12px;
  border: 1px solid var(--navy);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: var(--font-body);
  color: var(--text);
}

h1 {
  color: var(--navy);
  font-family: var(--font-heading);
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

label {
  display: block;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  margin-top: 16px;
  margin-bottom: 6px;
}

input,
select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--navy-light);
  border-radius: 8px;
  background: var(--bg);
  font-size: 14px;
  color: var(--text);
  box-sizing: border-box;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

input:focus,
select:focus {
  outline: none;
  border-color: var(--navy-light);
  box-shadow: 0 0 0 3px var(--anneau-focus);
  background: var(--color-surface-page);
}

.champ-invalide,
.champ-invalide:focus {
  border-color: var(--accent);
}

ul {
  font-family: var(--font-body);
  list-style: disc;
  padding-left: 20px;
  margin: 8px 0 0;
  font-size: 13px;
}

li {
  font-family: var(--font-body);
  padding: 2px 0;
}

.invalide {
  color: var(--accent);
}

.valide {
  color: var(--color-status-valid);
}

p.invalide {
  font-size: 13px;
  margin-top: 4px;
}

div input[type='checkbox'] {
  width: auto;
  margin-right: 8px;
  accent-color: var(--navy);
}

form > div:last-of-type {
  display: flex;
  align-items: center;
  margin-top: 20px;
}

form > div:last-of-type label {
  display: inline;
  margin: 0;
  font-weight: 400;
  color: var(--text);
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  margin-bottom: 16px;
}

.skill-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--navy);
  color: var(--color-on-brand);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 10px 6px 14px;
  border-radius: 5px;
  line-height: 1;
}

.skill-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--color-on-brand);
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.skill-remove:hover {
  background: color-mix(in srgb, var(--color-on-brand) 30%, transparent);
}

button[type='submit'] {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  background: var(--accent);
  color: var(--color-on-action);
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

button[type='submit']:hover:not(:disabled) {
  background: var(--accent-hover);
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
