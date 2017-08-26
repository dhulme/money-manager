import Vue from 'vue';
import accounting from 'accounting';
import moment from 'moment';
import VueI18n from 'vue-i18n';

import App from './App';
import router from './router';
import messages from './messages.json';
import store from './store';

import project from '@/project';

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');

Vue.config.productionTip = false;

Vue.use(VueI18n);

project.load().then(() => {
  Vue.filter('currency', (value) => {
    if (value === undefined || value === null) {
      return '';
    }
    return accounting.formatMoney(value, '£', 2, ',', '.');
  });

  Vue.filter('date', (value) => {
    return moment(value).format('DD/MM/YYYY');
  });

  Vue.prototype.$project = project;

  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {
      App,
    },
    i18n: new VueI18n({
      locale: 'en',
      messages,
    }),
    store,
  });
});
