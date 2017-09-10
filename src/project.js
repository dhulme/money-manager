import Big from 'big.js';

import util from '@/util';

import example from '../example.json';

let data = {};
const transactionPageLength = 20;

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

  budgets() {
    return project.accountsByType('budget');
  },

  accounts() {
    return data.accounts;
  },

  accountsByType(type) {
    return project.accounts().filter(account => account.type === type);
  },

  account(id) {
    return project.accounts().find(account => account.id === id);
  },

  assets() {
    return project.accountsByType('asset');
  },

  budget(id) {
    return project.budgets().find(budget => budget.id === id);
  },

  asset(id) {
    return project.assets().find(asset => asset.id === id);
  },
  
  transactionTypes() {
    return ['expense', 'transfer'];
  },

  transactions({
    account,
    pageLength = transactionPageLength,
    pageNumber = 1,
  }) {
    const transactionIds = account.transactionIds;
    const start = Math.min(transactionIds.length - (pageLength * pageNumber), 0);
    return transactionIds.slice(start).map(id => data.transactions[id]);
  },

  addTransaction(transaction) {
    const transactionId = util.getId();
    const accountTo = project.account(transaction.to);
    const accountFrom = project.account(transaction.from);
    data.transactions[transactionId] = transaction;
    
    accountFrom.balance = new Big(accountFrom.balance).minus(transaction.value);
    if (transaction.type === 'expense') {
      const transaction2 = {
        ...transaction,
        from: transaction.to,
        to: null,
        expenseAccount: transaction.from,
      };
      const transaction2Id = util.getId();
      data.transactions[transaction2Id] = transaction2;
      accountTo.transactionIds.push(transaction2Id);
      accountTo.balance = new Big(accountTo.balance).minus(transaction.value);

      transaction.expenseAccount = transaction.to;
      transaction.to = null;
      accountFrom.transactionIds.push(transactionId);
    } else {
      accountFrom.transactionIds.push(transactionId);
      accountTo.transactionIds.push(transactionId);
      accountTo.balance = new Big(accountTo.balance).plus(transaction.value);
    }
    
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
    const existingIds = data.accounts().map(account => account.id);
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
      transaction.description = newBulkTransaction.description;
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
