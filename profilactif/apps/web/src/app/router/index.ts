import {createRouter, createWebHistory, type RouteRecordRaw} from 'vue-router'

import { useAuthStore } from '@/shared/stores/auth';
import { ROUTE_ESPACE } from '@/shared/types/roles';
import type { Role } from '@/shared/types/roles';

declare module 'vue-router' {
  interface RouteMeta {
    /* Roles allowed on this route. Absent means public. */
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
  /*
   * Kept as a redirect rather than deleted: the landing section and the
   * fixtures still build links with this name.
   */
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
  /* No id in the path: the view always reads the logged-in candidate. */
  {
    path: '/candidate/profile',
    name: 'candidate-public-profile',
    component: () => import('@/features/profil/views/ProfilPublicView.vue'),
    meta: { roles: ['seeker'] },
  },
  {
    path: '/candidate/certification',
    name: 'candidate-certification',
    component: () => import('@/features/certification/views/CertificationView.vue'),
    meta: { roles: ['seeker'] },
  },
  /* Same screen: QuestionnaireView only re-exports CertificationView. */
  {
    path: '/certification',
    name: 'certification-questionnaire',
    redirect: { name: 'candidate-certification' },
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
  /* Catch-all, kept last: anything unmatched above lands on the 404. */
  {
    path: '/:cheminInconnu(.*)',
    name: 'not-found',
    component: () => import('@/shared/ui/PageErreur.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  /* Without this, an anchor link only works from the page it points at. */
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

  /* Awaited, otherwise a page reload runs the guard before /auth/me answers
     and throws out a user who is in fact logged in. */
  const authStore = useAuthStore();
  await authStore.initializeAuth();

  const compte = authStore.user;

  if (compte === null) {
    return { name: 'login', query: { suite: to.fullPath } };
  }

  /* Wrong role: back to their own space rather than an error screen. A
     candidate asking for another candidate's sheet lands on their dashboard. */
  if (!roles.includes(compte.role)) {
    return { name: ROUTE_ESPACE[compte.role] };
  }

  return true;
});
