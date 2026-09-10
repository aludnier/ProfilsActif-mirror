<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import { computed, nextTick, ref, onMounted } from 'vue';

import AdminService from '@/features/admin/api';
import NavAdmin from '@/features/admin/components/NavAdmin.vue';
import type { PublicUser } from '@/shared/types/api';

const users = ref<PublicUser[]>([]);
const search = ref('');
const selected = ref<PublicUser | null>(null);
const edit = ref({
  firstName: '',
  lastName: '',
  phone: '',
  mail: '',
  role: 'seeker' as 'seeker' | 'recruiter' | 'admin',
  status: 'active' as 'active' | 'suspended',
});
const loading = ref(true);
const saving = ref(false);
const error = ref('');
const success = ref('');
const currentPage = ref(1);
const totalPages = ref(1);
const totalUsers = ref(0);
const editSection = ref<HTMLElement | null>(null);
const userToDelete = ref<PublicUser | null>(null);
const deleteConfirmationOpen = ref(false);

const roleLabels: Record<string, string> = {
  seeker: 'Candidat',
  recruiter: 'Recruteur',
  admin: 'Administrateur',
};
const statusLabels: Record<string, string> = {
  active: 'Actif',
  suspended: 'Désactivé',
  deleted: 'Désactivé',
};

/* Les listes déroulantes réutilisent les mêmes tables : un libellé, un seul endroit. */
const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));
const statusOptions = [
  { value: 'active', label: 'Actif' },
  { value: 'suspended', label: 'Désactiver' },
];

/* Fonds de pastille par statut, pris dans les tokens. */
const statusClasses: Record<string, string> = {
  active: 'bg-status-verified text-on-status-verified',
  suspended: 'bg-action-100 text-action-700',
  deleted: 'bg-surface-muted text-ink',
};

/* Doit rester aligné sur la taille demandée à l'API dans `load()`. */
const LIGNES_PAR_PAGE = 15;

/* Le Paginator raisonne en index de ligne, l'API en numéro de page. */
const premiereLigne = computed(() => (currentPage.value - 1) * LIGNES_PAR_PAGE);

async function load(page = currentPage.value): Promise<void> {
  loading.value = true;
  error.value = '';
  try {
    const userPage = await AdminService.getUsers(search.value, page, LIGNES_PAR_PAGE);
    users.value = userPage.data;
    currentPage.value = userPage.page;
    totalPages.value = userPage.totalPages;
    totalUsers.value = userPage.total;
  } catch (err: any) {
    error.value = err.message || 'Impossible de charger le panneau administrateur.';
  } finally {
    loading.value = false;
  }
}

function rechercher(): void {
  currentPage.value = 1;
  void load(1);
}

function changerPage(page: number): void {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  void load(page);
}

async function chooseUser(user: PublicUser): Promise<void> {
  selected.value = user;
  edit.value = {
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || '',
    mail: user.mail,
    role: user.role,
    status: user.status === 'active' ? 'active' : 'suspended',
  };
  success.value = '';
  await nextTick();
  editSection.value?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveUser(): Promise<void> {
  if (!selected.value) return;
  saving.value = true;
  error.value = '';
  success.value = '';
  try {
    let updated = await AdminService.updateUserProfile(selected.value.id, {
      firstName: edit.value.firstName,
      lastName: edit.value.lastName,
      phone: edit.value.phone || null,
      mail: edit.value.mail,
    });
    if (edit.value.role !== updated.role)
      updated = await AdminService.updateUserRole(updated.id, edit.value.role);
    if (edit.value.status !== updated.status)
      updated = await AdminService.updateUserStatus(updated.id, edit.value.status);
    const index = users.value.findIndex((user) => user.id === updated.id);
    if (index >= 0) users.value[index] = updated;
    selected.value = updated;
    success.value = 'Utilisateur mis à jour.';
  } catch (err: any) {
    error.value = err.message || 'Impossible de modifier cet utilisateur.';
  } finally {
    saving.value = false;
  }
}

function requestDeleteUser(user: PublicUser): void {
  userToDelete.value = user;
  deleteConfirmationOpen.value = true;
}

function cancelDeleteUser(): void {
  if (!saving.value) {
    deleteConfirmationOpen.value = false;
    userToDelete.value = null;
  }
}

async function confirmDeleteUser(): Promise<void> {
  const user = userToDelete.value;
  if (!user) return;

  saving.value = true;
  error.value = '';
  try {
    await AdminService.deleteUser(user.id);
    if (selected.value?.id === user.id) selected.value = null;
    success.value = 'Compte supprimé définitivement.';
    deleteConfirmationOpen.value = false;
    userToDelete.value = null;
    await load(currentPage.value);
    if (users.value.length === 0 && currentPage.value > 1) {
      await load(currentPage.value - 1);
    }
  } catch (err: any) {
    error.value = err.message || 'Impossible de supprimer ce compte.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  void load();
});
</script>

<template>
  <main class="min-h-screen bg-surface-subtle p-6 lg:p-10">
    <div class="mx-auto flex max-w-7xl flex-col gap-8">
      <NavAdmin />
      <header class="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 class="text-[28px] text-brand">Administration</h1>
          <p class="text-[15px] text-ink-muted">
            Gestion des utilisateurs et modération des publications.
          </p>
        </div>
        <Button
          label="Actualiser"
          severity="secondary"
          outlined
          class="rounded-control"
          :loading="loading"
          @click="() => load()"
        />
      </header>

      <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>
      <Message v-if="success" severity="success" :closable="false">{{ success }}</Message>

      <div v-if="loading" class="text-[15px] text-ink-muted">Chargement...</div>

      <div v-else class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card class="rounded-card border border-surface-line">
          <template #title>
            <div class="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="text-[19px]">Utilisateurs</h2>
                <p class="text-[14px] font-normal text-ink-muted">{{ totalUsers }} résultat(s)</p>
              </div>
              <div class="flex gap-2">
                <InputText
                  v-model="search"
                  class="rounded-control text-[14px]"
                  placeholder="Rechercher un nom ou un email"
                  aria-label="Rechercher un utilisateur"
                  @keyup.enter="rechercher"
                />
                <Button label="Rechercher" class="rounded-control" @click="rechercher" />
              </div>
            </div>
          </template>

          <template #content>
            <!-- Pagination côté serveur : le Paginator est piloté à part, la
                 table ne pagine pas elle-même. -->
            <DataTable :value="users" data-key="id" size="small" striped-rows>
              <Column header="Utilisateur">
                <template #body="{ data }">
                  <strong>{{ data.firstName }} {{ data.lastName }}</strong>
                  <br />
                  <span class="text-ink-muted">{{ data.mail }}</span>
                </template>
              </Column>
              <Column header="Rôle">
                <template #body="{ data }">
                  <Tag
                    rounded
                    :value="roleLabels[data.role]"
                    class="bg-brand-50 px-2 py-1 font-heading text-[12px] font-bold text-brand"
                  />
                </template>
              </Column>
              <Column header="Statut">
                <template #body="{ data }">
                  <Tag
                    rounded
                    :value="statusLabels[data.status]"
                    class="px-2 py-1 font-heading text-[12px] font-bold"
                    :class="statusClasses[data.status]"
                  />
                </template>
              </Column>
              <Column>
                <template #body="{ data }">
                  <div class="flex justify-end gap-2">
                    <Button
                      label="Modifier"
                      severity="secondary"
                      outlined
                      class="rounded-control"
                      @click="chooseUser(data)"
                    />
                    <Button
                      label="Supprimer"
                      severity="danger"
                      outlined
                      class="rounded-control"
                      :disabled="saving"
                      @click="requestDeleteUser(data)"
                    />
                  </div>
                </template>
              </Column>
              <template #empty>
                <p class="py-4 text-[14px] text-ink-muted">
                  Aucun utilisateur pour cette recherche.
                </p>
              </template>
            </DataTable>

            <Paginator
              v-if="totalPages > 1"
              :first="premiereLigne"
              :rows="LIGNES_PAR_PAGE"
              :total-records="totalUsers"
              class="pt-4"
              @page="changerPage($event.page + 1)"
            />
          </template>
        </Card>

        <!-- Le ref reste sur un élément DOM : `scrollIntoView` n'existe pas sur
             une instance de composant, et l'appel échouerait en silence. -->
        <div ref="editSection">
          <Card class="rounded-card border border-surface-line">
            <template #title><h2 class="text-[19px]">Modifier un utilisateur</h2></template>
            <template #content>
              <p v-if="!selected" class="text-[14px] text-ink-muted">
                Sélectionnez un utilisateur dans la liste.
              </p>
              <form v-else class="flex flex-col gap-4" @submit.prevent="saveUser">
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Prénom
                  <InputText
                    v-model="edit.firstName"
                    class="rounded-control font-normal"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Nom
                  <InputText v-model="edit.lastName" class="rounded-control font-normal" required />
                </label>
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Email
                  <InputText
                    v-model="edit.mail"
                    type="email"
                    class="rounded-control font-normal"
                    required
                  />
                </label>
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Téléphone
                  <InputText v-model="edit.phone" class="rounded-control font-normal" />
                </label>
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Rôle
                  <Select
                    v-model="edit.role"
                    :options="roleOptions"
                    option-label="label"
                    option-value="value"
                    class="rounded-control font-normal"
                  />
                </label>
                <label class="flex flex-col gap-1 text-[14px] font-semibold text-brand">
                  Statut
                  <Select
                    v-model="edit.status"
                    :options="statusOptions"
                    option-label="label"
                    option-value="value"
                    class="rounded-control font-normal"
                  />
                </label>
                <Button
                  type="submit"
                  label="Enregistrer les modifications"
                  class="rounded-control"
                  :loading="saving"
                />
              </form>
            </template>
          </Card>
        </div>
      </div>
    </div>
  </main>

  <!-- Dialog gère lui-même le fond, le focus et la touche Échap. -->
  <Dialog
    v-model:visible="deleteConfirmationOpen"
    modal
    :closable="!saving"
    :draggable="false"
    class="w-full max-w-lg"
    header="Supprimer ce compte ?"
    @hide="cancelDeleteUser"
  >
    <div class="flex flex-col gap-3">
      <p class="font-heading text-[12px] font-bold uppercase tracking-[0.5px] text-status-error">
        Suppression définitive
      </p>
      <p class="text-[15px] leading-[1.6] text-ink">
        Le compte de
        <strong>{{ userToDelete?.firstName }} {{ userToDelete?.lastName }}</strong>
        sera supprimé avec toutes ses données associées.
      </p>
      <p class="text-[14px] leading-[1.6] text-ink-muted">
        Cette action est irréversible. Les profils, vidéos, favoris, contacts et certifications liés
        seront également supprimés.
      </p>
    </div>

    <template #footer>
      <Button
        label="Annuler"
        severity="secondary"
        text
        :disabled="saving"
        class="rounded-control px-5 py-2.5"
        @click="cancelDeleteUser"
      />
      <Button
        label="Supprimer définitivement"
        severity="danger"
        :loading="saving"
        class="rounded-control px-5 py-2.5 font-bold"
        @click="confirmDeleteUser"
      />
    </template>
  </Dialog>
</template>
