import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

import { useAuthStore } from '@/shared/stores/auth';
import { ROUTE_ESPACE } from '@/shared/types/roles';
import type { Role } from '@/shared/types/roles';

declare module 'vue-router' {
  interface RouteMeta {
    roles?: readonly Role[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/landing/views/LandingView.vue'),
  },
  {
    path: '/profiles',
    name: 'feed',
    component: () => import('@/features/profil/views/FeedView.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/views/ConnexionView.vue'),
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('@/features/auth/views/LogoutView.vue'),
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('@/features/auth/views/InscriptionView.vue'),
  },
  {
    path: '/profiles/:id',
    name: 'candidate-profile',
    redirect: (to) => ({ name: 'recruiter-candidate-profile', params: to.params }),
  },
  {
    path: '/recruiter/catalog',
    name: 'recruiter-catalog',
    component: () => import('@/features/recruteur/views/CatalogueView.vue'),
    meta: { roles: ['recruiter', 'admin'] },
  },
  {
    path: '/recruiter/dashboard',
    name: 'recruiter-dashboard',
    component: () => import('@/features/recruteur/views/TableauDeBordView.vue'),
    meta: { roles: ['recruiter', 'admin'] },
  },
  {
    path: '/recruiter/candidates/:id',
    name: 'recruiter-candidate-profile',
    component: () => import('@/features/recruteur/views/ProfilCandidatView.vue'),
    props: true,
    meta: { roles: ['recruiter', 'admin'] },
  },
  {
    path: '/candidate/dashboard',
    name: 'candidate-dashboard',
    component: () => import('@/features/profil/views/MonProfilView.vue'),
    meta: { roles: ['seeker'] },
  },
  {
    path: '/candidate/profile',
    name: 'candidate-public-profile',
    component: () => import('@/features/profil/views/ProfilPublicView.vue'),
    meta: { roles: ['seeker'] },
  },
  {
    path: '/candidate/certification',
    name: 'candidate-certification',
    component: () => import('@/features/certification/views/QuestionnaireView.vue'),
    meta: { roles: ['seeker'] },
  },
  {
    path: '/candidate/interactions',
    name: 'candidate-interactions',
    component: () => import('@/features/interaction/views/MesInteractionsView.vue'),
    meta: { roles: ['seeker'] },
  },
  {
    path: '/candidate/certification/resultat/:attemptId',
    name: 'candidate-certification-result',
    component: () => import('@/features/certification/views/ResultatView.vue'),
    props: true,
    meta: { roles: ['seeker'] },
  },
  {
    path: '/certification',
    name: 'certification-preview',
    component: () => import('@/features/certification/views/CertificationView.vue'),
  },
  {
    path: '/admin/stats',
    name: 'admin-stats',
    component: () => import('@/features/admin/views/StatistiquesView.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/features/admin/views/AdminDashboardView.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/admin/questions',
    name: 'admin-questions',
    component: () => import('@/features/admin/views/GestionQuestionsView.vue'),
    meta: { roles: ['admin'] },
  },
  {
    path: '/:cheminInconnu(.*)',
    name: 'not-found',
    component: () => import('@/shared/ui/PageErreur.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, _from, position) {
    if (to.hash !== '') {
      return { el: to.hash, behavior: 'smooth' };
    }

    return position ?? { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const roles = to.meta.roles;

  if (roles === undefined) {
    return true;
  }
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  const compte = authStore.user;

  if (compte === null) {
    return { name: 'login', query: { suite: to.fullPath } };
  }

  if (!roles.includes(compte.role)) {
    return { name: ROUTE_ESPACE[compte.role] };
  }

  return true;
});
