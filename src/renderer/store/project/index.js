import mutations from './mutations';
import actions from './actions';
import getters from './getters';

const project = {
  namespaced: true,
  state: {
    accountCategories: [
      { id: 'assets', name: 'Assets', type: 'asset' },
      {
        id: 'liabilities',
        name: 'Liabilities',
        type: 'asset'
      },
      {
        id: 'budgets',
        name: 'Budgets',
        type: 'budget'
      }
    ],
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
