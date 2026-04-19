import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { format } from 'date-fns';

import vuetify from './plugins/vuetify';
import App from './App.vue';
import router from './router';

import history from './history';
import ipc from './ipc';

import hotkey, { hotkeyDirective } from './hotkey';

hotkey.init({
  add: {
    name: 'n',
    code: 78,
    ctrl: true,
  },
  balance: {
    name: 'b',
    code: 66,
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

const app = createApp(App);

app.config.globalProperties.$ipc = ipc;
app.directive('hotkey', hotkeyDirective);

app.use(vuetify);
app.use(createPinia());
app.use(router);
app.use(history, {
  router,
  async ready() {
    const { currencyPrefix, dateFormat } = await ipc.getSettings() as { currencyPrefix: string; dateFormat: string };

    app.config.globalProperties.$currencyPrefix = currencyPrefix;

    // Convert moment.js format tokens to date-fns tokens for legacy settings
    const dateFnsFormat = dateFormat
      .replace(/YYYY/g, 'yyyy')
      .replace(/DD/g, 'dd');

    app.config.globalProperties.$dateFormat = dateFnsFormat;

    const numberFormat = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    });

    app.config.globalProperties.$currency = (value: number | null | undefined) => {
      if (value === undefined || value === null) {
        return '';
      }
      if (value === 0 && Object.is(value, -0)) {
        value = 0;
      }
      const formatted = numberFormat.format(value);

      return currencyPrefix === '£'
        ? formatted
        : formatted.replace('£', currencyPrefix);
    };

    app.config.globalProperties.$date = (value: string | null | undefined) =>
      value ? format(new Date(value), dateFnsFormat) : '';

    app.mount('#app');
  },
});
