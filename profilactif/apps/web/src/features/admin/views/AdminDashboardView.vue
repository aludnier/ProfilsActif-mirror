<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import { ref, onMounted } from 'vue'

import AdminService from '@/features/admin/api'
import LecteurYouTube from '@/shared/ui/LecteurYouTube.vue'
import { extraireIdYouTube } from '@/shared/youtube'
import type { PublicUser, Video } from '@/shared/types/api'

const users = ref<PublicUser[]>([])
const pendingVideos = ref<Video[]>([])
const search = ref('')
const selected = ref<PublicUser | null>(null)
const edit = ref({ firstName: '', lastName: '', phone: '', mail: '', role: 'seeker' as 'seeker' | 'recruiter' | 'admin', status: 'active' as 'active' | 'suspended' | 'deleted' })
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const success = ref('')

const roleLabels: Record<string, string> = {
  seeker: 'Candidat',
  recruiter: 'Recruteur',
  admin: 'Administrateur',
}
const statusLabels: Record<string, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
}

async function load(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const [userPage, videos] = await Promise.all([
      AdminService.getUsers(search.value),
      AdminService.getPendingVideos(),
    ])
    users.value = userPage.data
    pendingVideos.value = videos
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger le panneau administrateur.'
  } finally {
    loading.value = false
  }
}

function chooseUser(user: PublicUser): void {
  selected.value = user
  edit.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    mail: user.mail,
    role: user.role,
    status: user.status,
  }
  success.value = ''
}

async function saveUser(): Promise<void> {
  if (!selected.value) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    let updated = await AdminService.updateUserProfile(selected.value.id, {
      firstName: edit.value.firstName,
      lastName: edit.value.lastName,
      phone: edit.value.phone || null,
      mail: edit.value.mail,
    })
    if (edit.value.role !== updated.role) updated = await AdminService.updateUserRole(updated.id, edit.value.role)
    if (edit.value.status !== updated.status) updated = await AdminService.updateUserStatus(updated.id, edit.value.status)
    const index = users.value.findIndex((user) => user.id === updated.id)
    if (index >= 0) users.value[index] = updated
    selected.value = updated
    success.value = 'Utilisateur mis à jour.'
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier cet utilisateur.'
  } finally {
    saving.value = false
  }
}

async function deleteUser(user: PublicUser): Promise<void> {
  const confirmed = window.confirm('Supprimer définitivement ce compte et toutes ses données liées ?')
  if (!confirmed) return

  saving.value = true
  error.value = ''
  try {
    await AdminService.deleteUser(user.id)
    users.value = users.value.filter((item) => item.id !== user.id)
    if (selected.value?.id === user.id) selected.value = null
    success.value = 'Compte supprimé définitivement.'
  } catch (err: any) {
    error.value = err.message || 'Impossible de supprimer ce compte.'
  } finally {
    saving.value = false
  }
}

async function moderate(video: Video, status: 'approved' | 'rejected'): Promise<void> {
  saving.value = true
  error.value = ''
  try {
    await AdminService.moderateVideo(video.id, status)
    pendingVideos.value = pendingVideos.value.filter((item) => item.id !== video.id)
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier le statut de la vidéo.'
  } finally {
    saving.value = false
  }
}

onMounted(() => { void load() })
</script>

<template>
  <main class="min-h-screen bg-surface-subtle p-6 lg:p-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-8">
      <header class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 class="text-[28px] text-brand">Administration</h1>
          <p class="text-[15px] text-ink-muted">Gestion des utilisateurs et modération des publications.</p>
        </div>
        <Button label="Actualiser" severity="secondary" outlined class="rounded-control" :loading="loading" @click="load" />
      </header>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

      <div v-if="loading" class="text-[15px] text-ink-muted">Chargement...</div>

      <div v-else class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section class="flex flex-col gap-5 rounded-card border border-surface-line bg-surface-page p-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 class="text-[19px]">Utilisateurs</h2>
              <p class="text-[14px] text-ink-muted">{{ users.length }} résultat(s)</p>
            </div>
            <div class="flex gap-2">
              <input v-model="search" class="rounded-control border border-surface-line px-3 py-2 text-[14px]" placeholder="Rechercher un nom ou un email" @keyup.enter="load">
              <Button label="Rechercher" class="rounded-control" @click="load" />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-[14px]">
              <thead class="border-b border-surface-line text-ink-muted">
                <tr><th class="px-3 py-3">Utilisateur</th><th class="px-3 py-3">Rôle</th><th class="px-3 py-3">Statut</th><th class="px-3 py-3"></th></tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-surface-line last:border-0">
                  <td class="px-3 py-3"><strong>{{ user.firstName }} {{ user.lastName }}</strong><br><span class="text-ink-muted">{{ user.mail }}</span></td>
                  <td class="px-3 py-3">{{ roleLabels[user.role] }}</td>
                  <td class="px-3 py-3">{{ statusLabels[user.status] }}</td>
                  <td class="flex justify-end gap-2 px-3 py-3"><Button label="Modifier" severity="secondary" outlined class="rounded-control" @click="chooseUser(user)" /><Button label="Supprimer" severity="danger" outlined class="rounded-control" :disabled="saving" @click="deleteUser(user)" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="flex flex-col gap-5 rounded-card border border-surface-line bg-surface-page p-6">
          <h2 class="text-[19px]">Modifier un utilisateur</h2>
          <p v-if="!selected" class="text-[14px] text-ink-muted">Sélectionnez un utilisateur dans la liste.</p>
          <form v-else class="flex flex-col gap-4" @submit.prevent="saveUser">
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Prénom<input v-model="edit.firstName" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink" required></label>
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Nom<input v-model="edit.lastName" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink" required></label>
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Email<input v-model="edit.mail" type="email" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink" required></label>
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Téléphone<input v-model="edit.phone" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink"></label>
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Rôle
              <select v-model="edit.role" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink">
                <option value="seeker">Candidat</option>
                <option value="recruiter">Recruteur</option>
                <option value="admin">Administrateur</option>
              </select>
            </label>
            <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">Statut
              <select v-model="edit.status" class="rounded-control border border-surface-line px-3 py-2 font-normal text-ink">
                <option value="active">Actif</option>
                <option value="suspended">Suspendu</option>
                <option value="deleted">Supprimé</option>
              </select>
            </label>
            <Button type="submit" label="Enregistrer les modifications" class="rounded-control" :loading="saving" />
          </form>
        </section>

        <section class="flex flex-col gap-5 rounded-card border border-surface-line bg-surface-page p-6 xl:col-span-2">
          <div><h2 class="text-[19px]">Vidéos en attente de validation</h2><p class="text-[14px] text-ink-muted">{{ pendingVideos.length }} vidéo(s) à traiter</p></div>
          <p v-if="pendingVideos.length === 0" class="text-[14px] text-ink-muted">Aucune vidéo en attente.</p>
          <div v-for="video in pendingVideos" :key="video.id" class="grid gap-5 border-t border-surface-line pt-5 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <LecteurYouTube v-if="extraireIdYouTube(video.url)" :id-you-tube="extraireIdYouTube(video.url)!" :titre="video.title || 'Vidéo à modérer'" />
              <video v-else :src="video.url" controls preload="metadata" class="aspect-video w-full rounded-control bg-black" />
            </div>
            <div class="flex flex-col gap-3">
              <h3 class="font-heading font-bold text-brand">{{ video.title || 'Vidéo de présentation' }}</h3>
              <p v-if="video.description" class="text-[14px] text-ink-muted">{{ video.description }}</p>
              <p class="text-[13px] text-ink-muted">Statut : En attente de validation</p>
              <div class="mt-auto flex flex-wrap gap-2">
                <Button label="Accepter" class="rounded-control" :disabled="saving" @click="moderate(video, 'approved')" />
                <Button label="Refuser" severity="danger" outlined class="rounded-control" :disabled="saving" @click="moderate(video, 'rejected')" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
