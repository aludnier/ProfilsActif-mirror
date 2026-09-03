<template>
  <form @submit="verifySubmit" @keydown.enter.prevent>
    <h1>Inscription</h1>
    <label for="firstName">Prenom</label><br>
    <input id="firstName" v-model="firstName" required/><br>
    
    <label for="lastName">Nom</label><br>
    <input id="lastName" v-model="lastName" required/><br>
    
    <label for="email">Email</label><br>
    <input id="email" v-model="email" required/><br>
    
    <label for="password">Mot de passe</label><br>
    <input id="password" type="password" :style="{'border-color': !passwordError ? '' : 'red' }" v-model="password" required/><br>

    <div v-if="password.length == 0 || !isPasswordValid">
      <p>le mot de passe doit contenir :</p>
      <ul>
        <li :id="password.length < 8 ? 'error' : 'green'">au moins 8 caractères</li>
        <li :id="!/[0-9]/.test(password) ? 'error' : 'green'">au moins 1 chiffre</li>
        <li :id="!/[A-Z]/.test(password) ? 'error' : 'green'">au moins 1 majuscule</li>
        <li :id="!character.test(password) ? 'error' : 'green'">au moins 1 character special</li>
      </ul>
    </div>

    <label v-bind:class="inputError" for="passwordConfirm">Confirmation du mot de passe</label><br>
    <input id="passwordConfirm" :style="{'border-color': !passwordError ? '' : 'red' }" type="password" v-model="confirmPasword" required/><br>

    <label for="birthday">Date de naissance</label><br>
    <input id="birthday" :style="{'border-color': !AgeError ? '' : 'red' }" type="date" v-model="birthday" required/><br>
    <p id="error" v-if="birthday != null && calculateAge < 18">date de naissance invalide</p>

    <label for="Status">Status</label><br>
    <select id="Status" v-model="status">
      <option value="">--choisir un status--</option>
      <option value="Seeker">Chercheur d'emplois</option>
      <option value="Recruiter">Recruteur</option>
    </select><br>
    <div v-if="status == 'Seeker'">
      <label for="location">Location</label><br>
      <input id="location" v-model="location" required/><br>
      
      <label for="sector">Secteur de recherche</label><br>
      <input id="sector"/><br>

      <label for="skills">Skills</label><br>
      <input id="skills" v-model="tempSkill" @keyup.enter="addSkill"/><br>

      <div class="skills-list">
        <span class="skill-tag" v-for="(skill, index) in skills" :key="index">
          {{ skill }}
          <button type="button" class="skill-remove" @click="removeSkill(index)">✕</button>
        </span>
      </div>
    </div>
    <div>
      <input type="checkbox" v-model="CGU" required>
      <label>Accepter les conditions d'utilisation</label>
    </div>

    <button type="submit">Créer le compte</button>

  </form>
</template>

<script setup>
import { ref, computed } from 'vue'

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const confirmPasword = ref("")
const birthday = ref(null)
const status = ref("")
const CGU = ref(false)
const character = /[ `!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/
const location = ref("")
const tempSkill = ref("")
const skills = ref([])

const isPasswordValid = computed(() => {

  return (
    password.value.length >= 8 &&
    /[0-9]/.test(password.value) &&
    /[A-Z]/.test(password.value) &&
    character.test(password.value)
  )
})

function addSkill(){
  if (tempSkill != "")
  skills.value.push(tempSkill.value)
  tempSkill.value = ""
}


function removeSkill(index) {
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
const AgeError = ref(false)

function verifySubmit(event) {
  event.preventDefault()

  passwordError.value = false
  AgeError.value = false

  if (!isPasswordValid.value || password.value !== confirmPasword.value) {
    passwordError.value = true
  }
  if (calculateAge.value < 16) {
    AgeError.value = true
  }

  if (passwordError.value || AgeError.value) {
    return
  }
}
</script>

<style>
:root {
  --navy: #1B3A6B;
  --navy-light: #253e66;
  --accent: #d9534f;
  --accent-hover: #c44844;
  --bg: #f4f6f9;
  --text: #1B3A6B;
  --text-light: #6b7280;
}

template {
  font-family: 'Marianne';
}

form {
  max-width: 480px;
  margin: 40px auto;
  padding: 32px;
  background: #fff;
  border-radius: 12px;
  border: 1px solid var(--navy);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: var(--text);
}

h1 {
  color: var(--navy);
  font-family: 'Marianne';
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 24px;
}

label {
  display: block;
  font-family: 'Spectral';
  font-size: 15px;
  font-weight: 600;
  color: var(--navy);
  margin-top: 16px;
  margin-bottom: 6px;
}


input:focus,
select:focus {
  outline: re;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(44, 66, 112, 0.12);
  background: #ffb9b9;
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
  transition: border-color 0.15s, box-shadow 0.15s;
}


input:focus,
select:focus {
  outline: none;
  border-color: var(--navy-light);
  box-shadow: 0 0 0 3px rgba(44, 66, 112, 0.12);
  background: #fff;
}

ul {
  font-family: 'Spectral';
  list-style: disc;
  padding: 1;
  margin: 8px 0 0;
  font-size: 13px;
}

li {
  font-family: 'Spectral';
  padding: 2px 0;
}

#error {
  color: var(--accent);
}

#green {
  color: #3fc445;
}

p#error {
  font-size: 13px;
  margin-top: 4px;
}

div input[type="checkbox"] {
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
  color: #fff;
  font-family: 'Spectral';
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
  background: var(--navy-light);
  color: #fff;
  font-size: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.skill-remove:hover {
  background: var(--accent);
}

button[type="submit"] {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;
}

button[type="submit"]:hover {
  background: var(--accent-hover);
}
</style>
