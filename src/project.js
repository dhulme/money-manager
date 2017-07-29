import cryptoRandomString from 'crypto-random-string';

import example from '../example.json';

class Project {
  constructor() {
    this.data = {};
    this.transactionPageLength = 20;
    
    if (window.require) {
      this.remote = require('electron').remote.require('./project');
    } else {
      this.remote = {
        load(done) {
          done(null, example);
        },
      };
    }

    window.project = this;
  }

  load() {
    return new Promise((resolve) => {
      this.remote.load((err, data) => {
        this.data = data;
        resolve(data);
      });
    });
  }

  budgets() {
    return this.accountsByType('budget');
  }

  accounts() {
    return this.data.accounts;
  }

  accountsByType(type) {
    return this.accounts().filter(account => account.type === type);
  }

  account(id) {
    return this.accounts().find(account => account.id === id);
  }

  assets() {
    return this.accountsByType('asset');
  }

  budget(id) {
    return this.budgets().find(budget => budget.id === id);
  }

  asset(id) {
    return this.assets().find(asset => asset.id === id);
  }

  transactions({
    account,
    pageLength = this.transactionPageLength,
    pageNumber = 1,
  }) {
    const transactionIds = account.transactionIds;
    const start = Math.min(transactionIds.length - (pageLength * pageNumber), 0);
    return transactionIds.slice(start).map(id => this.data.transactions[id]);
  }

  addTransaction(transaction) {
    const transactionId = cryptoRandomString(10);
    this.data.transactions[transactionId] = transaction;
    this.account(transaction.to).transactionIds.push(transactionId);
    this.account(transaction.from).transactionIds.push(transactionId);
  }
}

export default new Project();
