import Big from 'big.js';
import moment from 'moment';

import util from '../util';

function getAddTransactionParams(transaction) {
  return {
    transaction: {
      ...transaction,
    },
    value: transaction.value,
    toAccountId: transaction.to,
    fromAccountId: transaction.from,
  };
}

const project = {
  state: {
    accounts: [],
    transactions: {},
    summary: {
      balance: 0,
    },
    bulkTransactions: [],
    bulkTransactionTransactions: {},
  },
  mutations: {
    init(state, data) {
      state.accounts = data.accounts;
      state.transactions = data.transactions;
      state.summary = data.summary;
      state.bulkTransactions = data.bulkTransactions;
      state.bulkTransactionTransactions = data.bulkTransactionTransactions;
    },

    addTransaction(state, {
      transaction,
      value,
      toAccountId,
      fromAccountId,
    }) {
      state.transactions[transaction.id] = transaction;
      const fromAccount = state.accounts.find(_ => _.id === fromAccountId);
      if (!fromAccount) {
        throw new Error(`Cannot find 'from' account called ${fromAccountId}`);
      }
      fromAccount.balance = new Big(fromAccount.balance).minus(value);
      fromAccount.transactionIds.push(transaction.id);

      const toAccount = state.accounts.find(_ => _.id === toAccountId);
      if (!toAccount) {
        throw new Error(`Cannot find 'to' account called ${fromAccountId}`);
      }
      toAccount.balance = new Big(toAccount.balance).add(value);
      toAccount.transactionIds.push(transaction.id);
    },

    updateSummaryBalance(state) {
      state.summary.balance = state.accounts.reduce((total, account) => {
        if (account.type === 'none') {
          return total;
        }

        if (account.type === 'budget') {
          return total.minus(account.balance);
        }

        return total.plus(account.balance);
      }, new Big(0));
    },

    deleteAccount(state, accountId) {
      state.accounts = state.accounts.filter(account => account.id !== accountId);
    },

    addAccount(state, {
      name,
      balance,
      type,
      category,
    }) {
      const existingIds = state.accounts.map(account => account.id);
      const newAccount = {
        transactionIds: [],
        id: util.getFriendlyId(name, existingIds),
        balance,
        type,
        category,
        name,
      };
      state.accounts.push(newAccount);

      return newAccount;
    },

    addBulkTransaction(state, {
      description,
      name,
    }) {
      const existingIds = state.bulkTransactions.map(_ => _.id);
      const bulkTransaction = {
        name,
        description,
        id: util.getFriendlyId(name, existingIds),
        transactionIds: [],
      };
      state.bulkTransactions.push(bulkTransaction);

      return bulkTransaction;
    },

    addUpdateBulkTransactionTransaction(state, {
      transaction: {
        to,
        from,
        value,
        note,
        id,
      },
      bulkTransaction,
    }) {
      state.bulkTransactionTransactions[id] = {
        to,
        from,
        value,
        note,
        id,
      };
      if (bulkTransaction && !bulkTransaction.transactionIds.includes(id)) {
        bulkTransaction.transactionIds.push(id);
      }
      return state.bulkTransactionTransactions[id];
    },
  },
  actions: {
    addTransaction({ commit }, {
      to,
      from,
      date,
      value,
      description,
      note,
      expense,
    }) {
      commit('addTransaction', getAddTransactionParams({
        to,
        from,
        date,
        value,
        description,
        note,
        expense,
      }));
      commit('updateSummaryBalance');
    },

    addDualTransaction({ commit }, { primary, secondary }) {
      commit('addTransaction', getAddTransactionParams(primary));
      commit('addTransaction', getAddTransactionParams(secondary));
      commit('updateSummaryBalance');
    },

    deleteAccount({ commit }, accountId) {
      commit('deleteAccount', accountId);
      commit('updateSummaryBalance');
    },

    runBulkTransactionTransactions({ commit }, {
      bulkTransaction,
      transactions,
    }) {
      transactions.forEach((transaction) => {
        commit('addTransaction', getAddTransactionParams({
          ...transaction,
          description: bulkTransaction.description,
          note: 'Bulk Transaction',
        }));
      });
    },

    updateBulkTransactionTransaction({ commit }, {
      transaction,
      transactionId,
    }) {
      commit('addUpdateBulkTransactionTransaction', {
        transaction,
        transactionId,
      });
    },

    addBulkTransactionTransaction({ commit }, {
      bulkTransaction,
      transaction,
    }) {
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      });
    },

    addBulkTransaction({ commit }, {
      description,
      name,
      transactions,
    }) {
      const bulkTransaction = commit('addBulkTransaction', {
        description,
        name,
      });
      transactions.forEach(transaction => commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      }));
    },

    addAccount({ commit }, {
      name,
      balance,
      type,
      category,
    }) {
      commit('addAccount', {
        name,
        balance,
        type,
        category,
      });
    },
  },
  getters: {
    accounts(state) {
      return state.accounts;
    },
    accountItems(state) {
      return state.accounts.sort((a, b) => {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      }).map(account => ({
        text: account.name,
        value: account.id,
      }));
    },
    accountsByCategory(state) {
      return category => state.accounts.filter(account => account.category === category);
    },
    account(state) {
      return id => state.accounts.find(account => account.id === id);
    },
    transactions(state) {
      return account => account.transactionIds.map(id => state.transactions[id]);
    },
    transactionId(state) {
      return transaction => Object.entries(state.transactions).find((entry) => {
        return entry[1] === transaction;
      })[0];
    },
    summaryBalance(state) {
      return state.summary.balance;
    },
    summaryBalanceEqualsZero(state) {
      return new Big(state.summary.balance).eq(0);
    },
    accountsTotal(state, getters) {
      return (category) => {
        return getters.accountsByCategory(category).reduce((total, account) => {
          return total.plus(account.balance);
        }, new Big(0));
      };
    },
    bulkTransactions(state) {
      return state.bulkTransactions;
    },
    bulkTransaction(state) {
      return id => state.bulkTransactions.find(_ => _.id === id);
    },
    bulkTransactionTransactions(state) {
      return (bulkTransaction) => {
        return bulkTransaction.transactionIds.map(id => state.bulkTransactionTransactions[id]);
      };
    },
  },
};

window.projectStore = project;

export default project;

