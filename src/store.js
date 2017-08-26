import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    summaryBalance: '0',
  },
  mutations: {
    setSummaryBalance(state, value) {
      state.summaryBalance = value.toString();
    },
  },
  actions: {

  },
});

export default store;
