import Big from 'big.js';
import moment from 'moment';

import util from '@/util';

import example from '../example.json';

let data = {};

const remote = window.require ? window.require('electron').remote.require('./project') : {
  load(done) {
    done(null, JSON.stringify(example));
  },
  save(projectString, done) {
    done(null);
  },
};

const project = {
  load() {
    return new Promise((resolve, reject) => {
      remote.load((err, loadedData) => {
        if (err) {
          reject(err);
        } else {
          data = JSON.parse(loadedData);
          resolve(loadedData);
        }
      });
    });
  },

  save() {
    return new Promise((resolve, reject) => {
      remote.save(JSON.stringify(data), (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  },

  accounts() {
    return data.accounts;
  },

  accountsByType(type) {
    return project.accounts().filter(account => account.type === type);
  },

  accountsByCategory(category) {
    return project.accounts().filter(account => account.category === category);
  },

  account(id) {
    return project.accounts().find(account => account.id === id);
  },

  transactions(account) {
    return account.transactionIds.map(id => data.transactions[id]);
  },

  addTransaction({
    to,
    from,
    date = moment(),
    value
  }) {
    const transaction = {
      to,
      from,
      date,
      value
    };
    const transactionId = util.getId();
    const accountTo = project.account(to);
    const accountFrom = project.account(from);

    data.transactions[transactionId] = transaction;
    accountFrom.balance = new Big(accountFrom.balance).minus(value);
    accountFrom.transactionIds.push(transactionId);
    accountTo.balance = new Big(accountTo.balance).plus(value);
    accountTo.transactionIds.push(transactionId);
    
    project.updateSummaryBalance();
  },

  addTransactions(transactions) {
    transactions.forEach(transaction => project.addTransaction(transaction));
  },

  addBulkTransactionTransaction(bulkTransaction, {
    to,
    from,
    value
  }) {
    const transaction = {
      to,
      from,
      value
    };
    const transactionId = util.getId();
    data.bulkTransactionTransactions[transactionId] = transaction;
    bulkTransaction.transactionIds.push(transactionId);
  },

  addBulkTransactionTransactions(bulkTransaction, transactions) {
    transactions.forEach(_ => project.addBulkTransactionTransaction(bulkTransaction, _));
  },

  updateSummaryBalance() {
    data.summary.balance = data.accounts.reduce((total, account) => {
      if (account.type === 'none') {
        return total;
      }
      
      if (account.type === 'budget') {
        return total.minus(account.balance);
      }

      return total.plus(account.balance);
    }, new Big(0));
  },

  addAccount({
    name,
    balance,
    type,
  }) {
    const existingIds = data.accounts.map(account => account.id);
    const newAccount = {
      transactionIds: [],
      id: util.getFriendlyId(name, existingIds),
      balance,
      type,
      name,
    };
    data.accounts.push(newAccount);

    return newAccount;
  },

  sortAccounts(accounts) {
    return accounts.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      if (a.name < b.name) {
        return -1;
      }
      return 0;
    });
  },

  accountsTotal(accounts) {
    return accounts.reduce((total, account) => total.plus(account.balance), new Big(0));
  },

  summaryBalance() {
    return data.summary.balance;
  },

  summaryBalanceZero() {
    return new Big(data.summary.balance).eq(0);
  },

  deleteAccount(accountId) {
    data.accounts = data.accounts.filter(account => account.id !== accountId);
    project.updateSummaryBalance();
  },

  bulkTransactions() {
    return data.bulkTransactions;
  },

  bulkTransactionTransactions(bulkTransaction) {
    return bulkTransaction.transactionIds.map(id => data.bulkTransactionTransactions[id]);
  },

  addBulkTransaction({
    description,
    name
  }) {
    const existingIds = project.bulkTransactions().map(_ => _.id);
    const bulkTransaction = {
      name,
      description,
      id: util.getFriendlyId(name, existingIds),
      transactionIds: []
    };
    data.bulkTransactions.push(bulkTransaction);

    return bulkTransaction;
  },

  updateBulkTransactionTransaction(bulkTransaction, transaction) {
    // const bulkTransaction.transactions.find(_ => _.id === transaction.id);
  },

  bulkTransaction(id) {
    return project.bulkTransactions().find(bulkTransaction => bulkTransaction.id === id);
  },
};

window.project = project;

export default project;
