// import Vue from 'vue';
// import moment from 'moment';

// import vuetify from './plugins/vuetify';

// import App from './App';
// import store from './store/index';

// import history from './history';
// import ipc from './ipc';

// import hotkey from './hotkey';

// require('vuetify/dist/vuetify.min.css');

// Vue.config.productionTip = false;

// hotkey.init();

import { createApp } from 'vue';

import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import filters from './filters';
import ipc from './ipc';
import history from './history';
import hotkey from './hotkey';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
        },
      },
    },
  },
});

const { currencyPrefix, dateFormat } = await ipc.getSettings();

createApp(App)
  .use(vuetify)
  .use(router)
  .use(createPinia())
  .use(filters, { currencyPrefix, dateFormat })
  .use(history)
  .use(hotkey)
  .mount('#app');
