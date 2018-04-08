import Vue from 'vue';
import Vuex from 'vuex';
import project from './project';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    error: '',
    snackbar: {
      message: '',
      active: false,
    },
  },
  mutations: {
    setSummaryBalance(state, value) {
      state.summaryBalance = value.toString();
    },
    setError(state, value) {
      state.error = value;
      return value;
    },
    setSnackbarActive(state, value) {
      state.snackbar.active = value;
    },
    setSnackbarMessage(state, value) {
      state.snackbar.message = value;
    },
  },
  actions: {
    openSnackbar({ commit }, message) {
      commit('setSnackbarMessage', message);
      commit('setSnackbarActive', true);
    },
  },
  modules: {
    project,
  },
});

export default store;
