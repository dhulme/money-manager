import Big from 'big.js';
import Vue from 'vue';
import moment from 'moment';

import util from '../util';

function required(param) {
  throw new Error(`${param} is required`);
}

function requireObjectProperties(object, params) {
  const errors = params.reduce((acc, param) => {
    if (object[param] === undefined) {
      return [...acc, param];
    }
    return acc;
  }, []);
  if (errors.length) {
    required(errors.join(','));
  }
}

function getAddTransactionParams(transaction) {
  requireObjectProperties(transaction, ['value', 'to', 'from']);
  return {
    transaction: {
      ...transaction,
      highlighted: false
    },
    value: transaction.value,
    toAccountId: transaction.to,
    fromAccountId: transaction.from
  };
}

const project = {
  namespaced: true,
  state: {
    accounts: [],
    transactions: {},
    summary: {
      balance: 0
    },
    bulkTransactions: [],
    bulkTransactionTransactions: {}
  },
  mutations: {
    init(state, data) {
      const clonedData = JSON.parse(JSON.stringify(data));
      state.accounts = clonedData.accounts;
      state.transactions = clonedData.transactions;
      state.summary = clonedData.summary;
      state.bulkTransactions = clonedData.bulkTransactions;
      state.bulkTransactionTransactions =
        clonedData.bulkTransactionTransactions;
    },

    addTransaction(
      state,
      {
        transaction = required('transaction'),
        value = required('value'),
        toAccountId = required('toAccountId'),
        fromAccountId = required('fromAccountId')
      }
    ) {
      requireObjectProperties(transaction, ['id', 'value', 'from', 'to']);

      Vue.set(state.transactions, transaction.id, transaction);
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

    updateTransaction(state, transaction) {
      state.transactions[transaction.id] = {
        ...transaction
      };
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

    deleteAccount(state, accountId = required('accountId')) {
      const account = state.accounts.find(_ => _.id === accountId);
      account.deleted = true;
    },

    addAccount(state, account = required('account')) {
      requireObjectProperties(account, ['name', 'balance', 'type', 'category']);
      const { name, balance, type, category } = account;
      const existingIds = state.accounts.map(_ => _.id);
      const newAccount = {
        transactionIds: [],
        id: util.getFriendlyId(name, existingIds),
        balance,
        type,
        category,
        name,
        deleted: false
      };
      state.accounts.push(newAccount);
    },

    addBulkTransaction(state, bulkTransaction) {
      requireObjectProperties(bulkTransaction, ['description', 'name']);
      const { description, name } = bulkTransaction;
      const existingIds = state.bulkTransactions.map(_ => _.id);
      const newBulkTransaction = {
        name,
        description,
        id: bulkTransaction.id || util.getFriendlyId(name, existingIds),
        transactionIds: [],
        lastModified: bulkTransaction.lastModified || moment()
      };
      state.bulkTransactions.push(newBulkTransaction);
    },

    addUpdateBulkTransactionTransaction(
      state,
      {
        transaction = required('transaction'),
        bulkTransaction = required('bulkTransaction')
      }
    ) {
      requireObjectProperties(transaction, ['to', 'from', 'value', 'id']);
      requireObjectProperties(bulkTransaction, ['transactionIds']);
      const { to, from, value, note, id } = transaction;
      Vue.set(state.bulkTransactionTransactions, id, {
        to,
        from,
        value,
        note,
        id
      });
      if (!bulkTransaction.transactionIds.includes(id)) {
        bulkTransaction.transactionIds.push(id);
      }
      bulkTransaction.lastModified = moment();
    },

    deleteBulkTransactionTransaction(
      state,
      {
        transaction = required('transaction'),
        bulkTransaction = required('bulkTransaction')
      }
    ) {
      requireObjectProperties(transaction, ['id']);
      const { id } = transaction;
      requireObjectProperties(bulkTransaction, ['transactionIds']);
      Vue.delete(state.bulkTransactionTransactions, id);
      const index = bulkTransaction.transactionIds.indexOf(id);
      if (index !== -1) {
        bulkTransaction.transactionIds.splice(index, 1);
      }
      bulkTransaction.lastModified = moment();
    }
  },
  actions: {
    addTransaction({ commit }, transaction) {
      commit('addTransaction', getAddTransactionParams(transaction));
      commit('updateSummaryBalance');
    },

    addDualTransaction({ commit }, { primary, secondary }) {
      commit('addTransaction', getAddTransactionParams(primary));
      commit('addTransaction', getAddTransactionParams(secondary));
      commit('updateSummaryBalance');
    },

    updateTransaction({ commit }, transaction) {
      commit('updateTransaction', transaction);
    },

    deleteAccount({ commit }, accountId) {
      commit('deleteAccount', accountId);
      commit('updateSummaryBalance');
    },

    runBulkTransactionTransactions(
      { commit },
      { bulkTransaction, transactions }
    ) {
      transactions.forEach(transaction => {
        commit(
          'addTransaction',
          getAddTransactionParams({
            ...transaction,
            description: `Bulk Transaction (${bulkTransaction.description})`
          })
        );
      });
    },

    updateBulkTransactionTransaction(
      { commit },
      { bulkTransaction, transaction }
    ) {
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
    },

    deleteBulkTransactionTransaction(
      { commit },
      { bulkTransaction, transaction }
    ) {
      commit('deleteBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
    },

    addBulkTransactionTransaction(
      { commit },
      { bulkTransaction, transaction }
    ) {
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      });
    },

    addBulkTransaction(
      { commit, state, getters },
      { description, name, transactions }
    ) {
      const existingIds = state.bulkTransactions.map(_ => _.id);
      const id = util.getFriendlyId(name, existingIds);
      commit('addBulkTransaction', {
        description,
        name,
        id
      });
      const bulkTransaction = getters.bulkTransaction(id);
      transactions.forEach(transaction =>
        commit('addUpdateBulkTransactionTransaction', {
          bulkTransaction,
          transaction
        })
      );
    },

    addAccount({ commit }, { name, balance, type, category }) {
      commit('addAccount', {
        name,
        balance,
        type,
        category
      });
    }
  },
  getters: {
    accounts(state) {
      return state.accounts;
    },
    accountItems(state) {
      return state.accounts
        .sort((a, b) => {
          if (a.name > b.name) {
            return 1;
          }
          if (a.name < b.name) {
            return -1;
          }
          return 0;
        })
        .map(account => ({
          text: account.name,
          value: account.id
        }));
    },
    accountsByCategory(state) {
      return category =>
        state.accounts.filter(
          account => account.category === category && !account.deleted
        );
    },
    account(state) {
      return id => state.accounts.find(account => account.id === id);
    },
    transactions(state) {
      return account =>
        account.transactionIds.map(id => state.transactions[id]);
    },
    transaction(state) {
      return id => state.transactions[id];
    },
    summaryBalance(state) {
      return state.summary.balance;
    },
    summaryBalanceEqualsZero(state) {
      return new Big(state.summary.balance).eq(0);
    },
    accountsTotal(state, getters) {
      return category =>
        getters
          .accountsByCategory(category)
          .reduce((total, account) => total.plus(account.balance), new Big(0));
    },
    bulkTransactions(state) {
      return state.bulkTransactions.sort(
        (a, b) =>
          new Date(b.lastModified).valueOf() -
          new Date(a.lastModified).valueOf()
      );
    },
    bulkTransaction(state) {
      return id => state.bulkTransactions.find(_ => _.id === id);
    },
    bulkTransactionTransactions(state) {
      return bulkTransaction =>
        bulkTransaction.transactionIds.map(
          id => state.bulkTransactionTransactions[id]
        );
    },
    accountBalance(state) {
      return (account, transactionId) => {
        const transactionIds = account.transactionIds.slice(
          account.transactionIds.indexOf(transactionId) + 1
        );
        return transactionIds.reduce((balance, id) => {
          const transaction = state.transactions[id];
          return transaction.from === account.id
            ? balance.plus(transaction.value)
            : balance.minus(transaction.value);
        }, new Big(account.balance));
      };
    }
  }
};

window.projectStore = project;

export default project;
