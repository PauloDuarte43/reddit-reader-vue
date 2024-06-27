import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import VueGtm from 'vue-gtm';

Vue.use(VueGtm, {
    id: 'GTM-P6JXHL5K',
});

createApp(App).mount('#app')
