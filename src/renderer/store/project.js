import Big from 'big.js';
import moment from 'moment';

import util from '../util';

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
    addTransaction(state, {
      id,
      transaction,
      value,
      toAccountId,
      fromAccountId,
    }) {
      state.transactions[id] = transaction;
      const fromAccount = state.accounts.find(_ => _.id === fromAccountId);
      fromAccount.balance = new Big(fromAccount.balance).minus(value);
      fromAccount.transactionIds.push(id);

      const toAccount = state.accounts.find(_ => _.id === toAccountId);
      toAccount.balance = new Big(toAccount.balance).add(value);
      toAccount.transactionIds.push(id);
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
    }) {
      const existingIds = state.accounts.map(account => account.id);
      const newAccount = {
        transactionIds: [],
        id: util.getFriendlyId(name, existingIds),
        balance,
        type,
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
      },
      transactionId = util.getId(),
      bulkTransaction,
    }) {
      state.bulkTransactionTransactions[transactionId] = {
        to,
        from,
        value,
        note,
      };
      if (bulkTransaction) {
        bulkTransaction.transactionIds.push(transactionId);
      }
    },
  },
  actions: {
    addTransaction({
      state,
      commit,
    }, {
      to,
      from,
      date = moment(),
      value,
      description,
      note,
    }) {
      const transaction = {
        to,
        from,
        date,
        value,
        description,
        note,
      };
      const id = util.getId();
  
      commit('addTransaction', {
        transaction,
        id,
        value,
        toAccountId: to,
        fromAccountId: from,
      });
      
      commit('updateSummaryBalance');
    },

    addTransactions({
      dispatch,
    }, transactions) {
      transactions.forEach((transaction) => {
        dispatch('addTransaction', transaction);
      });
    },

    deleteAccount({
      commit,
    }, accountId) {
      commit('deleteAccount', accountId);
      commit('updateSummaryBalance');
    },

    runBulkTransactionTransaction({
      dispatch,
    }, {
      bulkTransaction,
      transaction,
    }) {
      dispatch('addTransaction', {
        ...transaction,
        description: bulkTransaction.description,
        note: 'Bulk Transaction',
      });
    },

    runBulkTransactionTransactions({
      dispatch,
    }, {
      bulkTransaction,
      transactions,
    }) {
      transactions.forEach((transaction) => {
        dispatch('runBulkTransactionTransaction', {
          bulkTransaction,
          transaction,
        });
      });
    },

    addBulkTransactionTransactions({
      commit,
    }, {
      bulkTransaction,
      transactions,
    }) {
      transactions.forEach(transaction => commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      }));
    },

    updateBulkTransactionTransaction({
      commit,
    }, {
      transaction,
      transactionId,
    }) {
      commit('addUpdateBulkTransactionTransaction', {
        transaction,
        transactionId,
      });
    },

    addBulkTransaction({
      commit,
    }, {
      description,
      name,
    }) {
      commit('addBulkTransaction', {
        description,
        name,
      });
    },

    addAccount({
      commit,
    }, {
      name,
      balance,
      type,
    }) {
      commit('addAccount', {
        name,
        balance,
        type,
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
    accountsByType(state) {
      return type => state.accounts.filter(account => account.type === type);
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
    bulkTransactionTransactionId(state) {
      return transaction => Object.entries(state.bulkTransactionTransactions).find((entry) => {
        return entry[1] === transaction;
      })[0];
    },
  },
};

export default project;

