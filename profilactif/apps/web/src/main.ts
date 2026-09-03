import { createApp } from 'vue';

import App from '@/app/App.vue';
import { installPrimeVue } from '@/app/plugins/primevue';
import { router } from '@/app/router';
import '@/assets/styles/main.css';

const app = createApp(App);

app.use(router);
installPrimeVue(app);

app.mount('#app');
