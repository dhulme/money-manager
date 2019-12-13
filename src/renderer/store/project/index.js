import mutations from './mutations';
import actions from './actions';
import getters from './getters';

const project = {
  namespaced: true,
  state: {
    accountCategories: [],
    accounts: [],
    transactions: {},
    summary: {
      balance: 0
    },
    bulkTransactions: [],
    bulkTransactionTransactions: {}
  },
  mutations,
  actions,
  getters
};

window.projectStore = project;

export default project;
