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

import hotkey from './hotkey';

require('vuetify/dist/vuetify.min.css');

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));

Vue.config.productionTip = false;

Vue.use(VueI18n);
Vue.use(Vuetify);

Vue.filter('currency', value => {
  if (value === undefined || value === null) {
    return '';
  }
  return accounting.formatMoney(value, '£', 2, ',', '.');
});

Vue.filter('date', value => {
  return value ? moment(value).format('DD/MM/YYYY') : '';
});

Vue.directive('focus', {
  inserted(element) {
    const inputElement =
      element.tagName === 'DIV' ? element.querySelector('input') : element;
    inputElement.focus();
  }
});

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
  }
});

Vue.prototype.$ipc = ipc;

Vue.config.keyCodes = {
  add: 65 // a
};

Vue.use(history, {
  store,
  ready() {
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
      store
    }).$mount('#app');
  }
});
