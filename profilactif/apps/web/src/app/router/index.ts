import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/features/landing/views/LandingView.vue'),
  },
  {
    path: '/profiles',
    name: 'profiles',
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
    component: () => import('@/features/profil/views/ProfilPublicView.vue'),
    props: true,
  },
  {
    path: '/recruiter/catalog',
    name: 'recruiter-catalog',
    component: () => import('@/features/recruteur/views/CatalogueView.vue'),
  },
  {
    path: '/candidate/dashboard',
    name: 'candidate-dashboard',
    component: () => import('@/features/profil/views/MonProfilView.vue'),
  },
  /*
   * ATTENTION — route non gardée. L'édition des questions et des pondérations
   * de la certification doit être réservée au rôle `admin` (requireRole côté
   * API), mais il n'existe encore ni store d'auth ni garde de navigation :
   * cette page est donc accessible à quiconque connaît l'URL.
   */
  {
    path: '/admin/questions',
    name: 'admin-questions',
    component: () => import('@/features/admin/views/GestionQuestionsView.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
