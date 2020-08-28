import Vue from 'vue';
import Vuex from 'vuex';
import project from './project';

Vue.use(Vuex);

function initialNewBulkTransaction() {
  return {
    name: '',
    description: '',
    transactions: [],
  };
}

const store = new Vuex.Store({
  state: {
    error: '',
    snackbar: {
      message: '',
      active: false,
    },
    newBulkTransaction: initialNewBulkTransaction(),
    importedTransactions: [],
    dialog: null,
    search: '',
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
    setNewBulkTransaction(state, value) {
      state.newBulkTransaction = value || initialNewBulkTransaction();
    },
    setImportedTransactions(state, value) {
      state.importedTransactions = value;
    },
    setDialog(state, dialog) {
      state.dialog = dialog;
    },
    setSearch(state, value) {
      state.search = value;
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

window.store = store;

export default store;
