import Vue from 'vue';
import accounting from 'accounting';
import moment from 'moment';
import VueI18n from 'vue-i18n';
import Vuetify from 'vuetify';

import App from './App';
import router from './router';
import messages from './messages.json';
import store from './store/index';

import history from './history';
import ipc from './ipc';

import('../../node_modules/vuetify/dist/vuetify.min.css');

Vue.config.productionTip = false;

Vue.use(VueI18n);
Vue.use(Vuetify);
Vue.use(history, store);

Vue.history.init().then(() => {
  Vue.filter('currency', (value) => {
    if (value === undefined || value === null) {
      return '';
    }
    return accounting.formatMoney(value, '£', 2, ',', '.');
  });

  Vue.filter('date', (value) => {
    return value ? moment(value).format('DD/MM/YYYY') : '';
  });

  Vue.prototype.$ipc = ipc;

  new Vue({
    el: '#app',
    router,
    components: {
      App,
    },
    template: '<App/>',
    i18n: new VueI18n({
      locale: 'en',
      messages,
    }),
    store,
  });
});
