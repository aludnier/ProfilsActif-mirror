import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from '@/app/App.vue';
import { installPrimeVue } from '@/app/plugins/primevue';
import { router } from '@/app/router';
import { useAuthStore } from '@/shared/stores/auth';
import '@/assets/styles/main.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
installPrimeVue(app);

// Initialiser l'authentification au démarrage
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');
