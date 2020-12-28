import Vue from 'vue';
import accounting from 'accounting';
import moment from 'moment';

import vuetify from './plugins/vuetify';

import App from './App';
import router from './router';
import store from './store/index';

import history from './history';
import ipc from './ipc';

import hotkey from './hotkey';

require('vuetify/dist/vuetify.min.css');

Vue.config.productionTip = false;

hotkey.init({
  add: {
    name: 'n',
    code: 78,
    ctrl: true,
  },
  new: {
    name: 'n',
    code: 78,
    ctrl: true,
    shift: true,
  },
  close: {
    name: 'escape',
    code: 27,
  },
  save: {
    name: 's',
    code: 83,
    ctrl: true,
  },
  saveAs: {
    name: 's',
    code: 83,
    ctrl: true,
    shift: true,
  },
  open: {
    name: 'o',
    code: 79,
    ctrl: true,
  },
  undo: {
    name: 'z',
    code: 90,
    ctrl: true,
  },
  redo: {
    name: 'y',
    code: 89,
    ctrl: true,
  },
  settings: {
    name: ',',
    code: 188,
    ctrl: true,
  },
  quit: {
    name: 'q',
    code: 81,
    ctrl: true,
  },
});

Vue.prototype.$ipc = ipc;

Vue.use(history, {
  store,
  router,
  async ready() {
    const { currencyPrefix, dateFormat } = await ipc.getSettings();

    Vue.prototype.$currencyPrefix = currencyPrefix;
    Vue.prototype.$dateFormat = dateFormat;

    Vue.filter('currency', (value) => {
      if (value === undefined || value === null) {
        return '';
      }
      if (value === 0 && Object.is(value, -0)) {
        value = 0;
      }
      return accounting.formatMoney(value, currencyPrefix, 2, ',', '.');
    });

    Vue.filter('date', (value) =>
      value ? moment(value).format(dateFormat) : ''
    );

    new Vue({
      router,
      components: {
        App,
      },
      template: '<App/>',
      store,
      vuetify,
    }).$mount('#app');
  },
});
