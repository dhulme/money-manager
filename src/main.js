// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import accounting from 'accounting';
import moment from 'moment';

import project from '@/project';

require('../node_modules/bootstrap/dist/css/bootstrap.min.css');

Vue.config.productionTip = false;

project.load().then(() => {
  Vue.filter('currency', (value) => {
    if (value === undefined) {
      return '';
    }
    return '£' + (value / 100).toFixed(2);
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
    }
  });
});
