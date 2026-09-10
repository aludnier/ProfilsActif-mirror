<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ProfileService from '@/services/ProfileService'
import FavoriteService from '@/services/FavoriteService'
import ContactService from '@/services/ContactService'
import { useAuthStore } from '@/shared/stores/auth'
import type { Contact, Favorite, Profile } from '@/shared/types/api'

type Category = 'favorites' | 'viewed' | 'contacted'
const auth = useAuthStore()
const category = ref<Category>('favorites')
const profiles = ref<Profile[]>([])
const favorites = ref<Favorite[]>([])
const contacts = ref<Contact[]>([])
const viewedIds = ref<string[]>([])
const loading = ref(true)
const error = ref('')

const recruiterId = computed(() => auth.user?.id ?? '')
const currentItems = computed(() => {
  if (category.value === 'favorites') return profiles.value.filter((p) => favorites.value.some((f) => f.seekerId === p.id))
  if (category.value === 'contacted') return profiles.value.filter((p) => contacts.value.some((c) => c.seekerId === p.id))
  return profiles.value.filter((p) => viewedIds.value.includes(p.id))
})
const count = computed(() => ({
  favorites: favorites.value.length,
  viewed: viewedIds.value.length,
  contacted: new Set(contacts.value.map((c) => c.seekerId)).size,
}))

async function load() {
  if (!recruiterId.value || auth.user?.role !== 'recruiter') {
    error.value = 'Cet espace est reserve aux recruteurs.'
    loading.value = false
    return
  }
  try {
    const [allProfiles, recruiterFavorites, recruiterContacts] = await Promise.all([
      ProfileService.getProfiles(),
      FavoriteService.getFavoritesByRecruiter(recruiterId.value),
      ContactService.getContactsByRecruiter(recruiterId.value),
    ])
    profiles.value = allProfiles
    favorites.value = recruiterFavorites
    contacts.value = recruiterContacts
    viewedIds.value = JSON.parse(localStorage.getItem('recruiter-viewed-' + recruiterId.value) || '[]')
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger votre espace recruteur.'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <main class="min-h-screen bg-surface-subtle px-gutter py-10">
    <div class="mx-auto max-w-6xl space-y-8">
      <header class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p class="font-heading text-[12px] font-bold uppercase text-ink-muted">Espace recruteur</p>
          <h1 class="mt-2 text-[30px] text-brand">Mon tableau de bord</h1>
          <p class="mt-2 text-[15px] text-ink-muted">Retrouvez vos profils suivis et vos échanges.</p>
        </div>
        <router-link to="/recruiter/catalog" class="rounded-control bg-action px-5 py-3 font-heading text-[13px] font-bold text-white">
          Decouvrir les profils
        </router-link>
      </header>

      <p v-if="loading" class="text-ink-muted">Chargement de votre espace...</p>
      <p v-else-if="error" class="rounded-card border border-red-200 bg-red-50 p-5 text-red-700">{{ error }}</p>

      <template v-else>
        <nav class="grid gap-3 md:grid-cols-3" aria-label="Categories du tableau de bord">
          <button type="button" class="rounded-card border p-5 text-left" :class="category === 'favorites' ? 'border-brand bg-brand-50' : 'border-surface-line bg-surface-page'" @click="category = 'favorites'">
            <span class="block font-heading text-[13px] font-bold text-brand">Profils favoris</span>
            <strong class="mt-2 block text-[28px] text-brand">{{ count.favorites }}</strong>
          </button>
          <button type="button" class="rounded-card border p-5 text-left" :class="category === 'viewed' ? 'border-brand bg-brand-50' : 'border-surface-line bg-surface-page'" @click="category = 'viewed'">
            <span class="block font-heading text-[13px] font-bold text-brand">Profils consultes</span>
            <strong class="mt-2 block text-[28px] text-brand">{{ count.viewed }}</strong>
          </button>
          <button type="button" class="rounded-card border p-5 text-left" :class="category === 'contacted' ? 'border-brand bg-brand-50' : 'border-surface-line bg-surface-page'" @click="category = 'contacted'">
            <span class="block font-heading text-[13px] font-bold text-brand">Profils contactes</span>
            <strong class="mt-2 block text-[28px] text-brand">{{ count.contacted }}</strong>
          </button>
        </nav>

        <section class="rounded-card border border-surface-line bg-surface-page p-6">
          <h2 class="font-heading text-[17px] font-bold text-brand">
            {{ category === 'favorites' ? 'Mes profils favoris' : category === 'viewed' ? 'Mes profils consultes' : 'Mes profils contactes' }}
          </h2>
          <p v-if="!currentItems.length" class="mt-6 text-ink-muted">Aucun profil dans cette categorie.</p>
          <ul v-else class="mt-5 divide-y divide-surface-line">
            <li v-for="profile in currentItems" :key="profile.id" class="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div>
                <h3 class="font-heading font-bold text-brand">{{ profile.firstName }} {{ profile.lastName }}</h3>
                <p class="text-[14px]">{{ profile.targetSector || 'Candidat disponible' }}</p>
                <p class="text-[13px] text-ink-muted">{{ profile.location || 'Localisation non renseignee' }}</p>
              </div>
              <router-link :to="{ name: 'recruiter-candidate-profile', params: { id: profile.id } }" class="font-heading text-[13px] font-bold text-action hover:underline">
                Voir le profil
              </router-link>
            </li>
          </ul>
        </section>
      </template>
    </div>
  </main>
</template>
