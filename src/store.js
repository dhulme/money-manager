import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    summaryBalance: '0',
    error: '',
  },
  mutations: {
    setSummaryBalance(state, value) {
      state.summaryBalance = value.toString();
    },
    setError(state, value) {
      state.error = value;
      return value;
    },
  },
  actions: {

  },
});

export default store;
