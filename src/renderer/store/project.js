import Big from 'big.js';

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
      ...transaction
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
        transaction = required(),
        value = required(),
        toAccountId = required(),
        fromAccountId = required()
      }
    ) {
      requireObjectProperties(transaction, ['id', 'value', 'from', 'to']);

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

    deleteAccount(state, accountId = required()) {
      state.accounts = state.accounts.filter(
        account => account.id !== accountId
      );
    },

    addAccount(state, account = required()) {
      requireObjectProperties(account, ['name', 'balance', 'type', 'category']);
      const { name, balance, type, category } = account;
      const existingIds = state.accounts.map(_ => _.id);
      const newAccount = {
        transactionIds: [],
        id: util.getFriendlyId(name, existingIds),
        balance,
        type,
        category,
        name
      };
      state.accounts.push(newAccount);

      return newAccount;
    },

    addBulkTransaction(state, bulkTransaction) {
      requireObjectProperties(bulkTransaction, ['description', 'name']);
      const { description, name } = bulkTransaction;
      const existingIds = state.bulkTransactions.map(_ => _.id);
      const newBulkTransaction = {
        name,
        description,
        id: util.getFriendlyId(name, existingIds),
        transactionIds: []
      };
      state.bulkTransactions.push(newBulkTransaction);

      return bulkTransaction;
    },

    addUpdateBulkTransactionTransaction(
      state,
      { transaction = required(), bulkTransaction = required() }
    ) {
      requireObjectProperties(transaction, ['to', 'from', 'value', 'id']);
      requireObjectProperties(bulkTransaction, ['transactionIds']);
      const { to, from, value, note, id } = transaction;
      state.bulkTransactionTransactions[id] = {
        to,
        from,
        value,
        note,
        id
      };
      if (!bulkTransaction.transactionIds.includes(id)) {
        bulkTransaction.transactionIds.push(id);
      }
      return state.bulkTransactionTransactions[id];
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
            description: bulkTransaction.description,
            note: 'Bulk Transaction'
          })
        );
      });
    },

    updateBulkTransactionTransaction(
      { commit },
      { transaction, transactionId }
    ) {
      commit('addUpdateBulkTransactionTransaction', {
        transaction,
        transactionId
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

    addBulkTransaction({ commit }, { description, name, transactions }) {
      const bulkTransaction = commit('addBulkTransaction', {
        description,
        name
      });
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
        state.accounts.filter(account => account.category === category);
    },
    account(state) {
      return id => state.accounts.find(account => account.id === id);
    },
    transactions(state) {
      return account =>
        account.transactionIds.map(id => state.transactions[id]);
    },
    transactionId(state) {
      return transaction =>
        Object.entries(state.transactions).find(entry => {
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
      return category => {
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
      return bulkTransaction => {
        return bulkTransaction.transactionIds.map(
          id => state.bulkTransactionTransactions[id]
        );
      };
    }
  }
};

window.projectStore = project;

export default project;
