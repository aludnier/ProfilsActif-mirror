<script setup lang="ts"></script>

<template>
  <nav>
    <router-link :to="{ name: 'home' }">Accueil</router-link>
    <router-link :to="{ name: 'login' }">Connexion</router-link>
    <router-link :to="{ name: 'logout' }">Déconnexion</router-link>
    <router-link :to="{ name: 'signup' }">Inscription</router-link>
    <router-link :to="{ name: 'candidate-profile', params: { id: '1' } }">Fiche profil candidat</router-link>
    <router-link :to="{ name: 'recruiter-catalog' }">Catalogue recruteur</router-link>
    <router-link :to="{ name: 'edition-ceritification' }">Edition des questions</router-link>
  </nav>

  <router-view />
</template>
