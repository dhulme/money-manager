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

  addTransaction(transaction) {
    const transactionId = util.getId();
    const accountTo = project.account(transaction.to);
    const accountFrom = project.account(transaction.from);

    if (!transaction.date) {
      transaction.date = moment();
    }

    data.transactions[transactionId] = transaction;
    accountFrom.balance = new Big(accountFrom.balance).minus(transaction.value);
    accountFrom.transactionIds.push(transactionId);
    accountTo.balance = new Big(accountTo.balance).plus(transaction.value);
    accountTo.transactionIds.push(transactionId);
    
    project.updateSummaryBalance();
  },

  addTransactions(transactions) {
    transactions.forEach(transaction => project.addTransaction(transaction));
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

  addBulkTransaction(newBulkTransaction) {
    const existingIds = project.bulkTransactions().map(bulkTransaction => bulkTransaction.id);
    newBulkTransaction.transactions.forEach((transaction) => {
      transaction.description = newBulkTransaction.name;
    });
    newBulkTransaction.id = util.getFriendlyId(newBulkTransaction.name, existingIds);
    data.bulkTransactions.push(newBulkTransaction);
  },

  bulkTransaction(id) {
    return project.bulkTransactions().find(bulkTransaction => bulkTransaction.id === id);
  },
};

window.project = project;

export default project;
