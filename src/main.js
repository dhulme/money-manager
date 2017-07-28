// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import accounting from 'accounting';

import data from '@/data';

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');

Vue.config.productionTip = false;

data.load().then((project) => {
  Vue.filter('currency', (value) => {
    return '£' + (value / 100).toFixed(2);
  });

  Vue.prototype.$project = project;

  new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {
      App,
    },
    filters: {
      currency(value) {
        return accounting.formatMoney(value / 100, '£', 2, ',', '.');
      }
    }
  });
});
