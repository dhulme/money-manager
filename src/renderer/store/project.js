import Big from 'big.js';
import moment from 'moment';

import util from '../util';

const project = {
  state: {
    accounts: [],
    transactions: {},
    summary: {},
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
      actions,
    }, transactions) {
      transactions.forEach((transaction) => {
        actions.dispatch('addTransaction', transaction);
      });
    },

    deleteAccount({
      commit,
    }, accountId) {
      commit('deleteAccount', accountId);
      commit('updateSummaryBalance');
    },
  },
  getters: {
    accounts(state) {
      return state.accounts;
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
  },
};

export default project;

