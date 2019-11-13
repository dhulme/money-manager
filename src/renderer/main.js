import Vue from 'vue';
import accounting from 'accounting';
import moment from 'moment';
import VueI18n from 'vue-i18n';

import vuetify from './plugins/vuetify';

import App from './App';
import router from './router';
import messages from './messages.json';
import store from './store/index';

import history from './history';
import ipc from './ipc';

import hotkey from './hotkey';

require('vuetify/dist/vuetify.min.css');

Vue.config.productionTip = false;

Vue.use(VueI18n);

hotkey.init({
  add: {
    name: 'n',
    code: 78,
    ctrl: true
  },
  new: {
    name: 'n',
    code: 78,
    ctrl: true,
    shift: true
  },
  close: {
    name: 'escape',
    code: 27
  },
  save: {
    name: 's',
    code: 83,
    ctrl: true
  },
  saveAs: {
    name: 's',
    code: 83,
    ctrl: true,
    shift: true
  },
  open: {
    name: 'o',
    code: 79,
    ctrl: true
  },
  undo: {
    name: 'z',
    code: 90,
    ctrl: true
  },
  redo: {
    name: 'y',
    code: 89,
    ctrl: true
  },
  settings: {
    name: ',',
    code: 188,
    ctrl: true
  },
  quit: {
    name: 'q',
    code: 81,
    ctrl: true
  }
});

Vue.prototype.$ipc = ipc;

Vue.use(history, {
  store,
  async ready() {
    const { currencyPrefix, dateFormat } = await ipc.getSettings();

    Vue.prototype.$currencyPrefix = currencyPrefix;
    Vue.prototype.$dateFormat = dateFormat;

    Vue.filter('currency', value => {
      if (value === undefined || value === null) {
        return '';
      }
      return accounting.formatMoney(value, currencyPrefix, 2, ',', '.');
    });

    Vue.filter('date', value =>
      value ? moment(value).format(dateFormat) : ''
    );

    new Vue({
      router,
      components: {
        App
      },
      template: '<App/>',
      i18n: new VueI18n({
        locale: 'en',
        messages
      }),
      store,
      vuetify
    }).$mount('#app');
  }
});
