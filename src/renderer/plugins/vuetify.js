import Vue from 'vue';
import '@mdi/font/css/materialdesignicons.css';
import Vuetify from 'vuetify';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        accent: '#1976D2',
      },
    },
  },
});
