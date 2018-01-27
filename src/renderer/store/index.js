import Vue from 'vue';
import Vuex from 'vuex';
import project from './project';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
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
  modules: {
    project,
  },
});

export default store;
