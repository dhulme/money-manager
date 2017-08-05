import cryptoRandomString from 'crypto-random-string';

import util from '@/util';

import example from '../example.json';

class Project {
  constructor() {
    this.data = {};
    this.transactionPageLength = 20;
    
    if (window.require) {
      this.remote = window.require('electron').remote.require('./project');
    } else {
      this.remote = {
        load(done) {
          done(null, JSON.stringify(example));
        },
        save(projectString, done) {
          done(null);
        },
      };
    }

    window.project = this;
  }

  load() {
    return new Promise((resolve, reject) => {
      this.remote.load((err, data) => {
        if (err) {
          reject(err);
        } else {
          this.data = JSON.parse(data);
          resolve(data);
        }
      });
    });
  }

  save() {
    return new Promise((resolve, reject) => {
      this.remote.save(JSON.stringify(this.data), (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
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
    const accountTo = this.account(transaction.to);
    const accountFrom = this.account(transaction.from);
    this.data.transactions[transactionId] = transaction;
    if (accountTo) {
      accountTo.transactionIds.push(transactionId);
      accountTo.balance += transaction.value;
    }
    if (accountFrom) {
      accountFrom.transactionIds.push(transactionId);
      accountFrom.balance -= transaction.value;
    }

    this.updateSummaryBalance();
  }

  updateSummaryBalance() {
    this.data.summary.balance = this.data.accounts.reduce((total, account) => {
      if (account.id !== 'none') {
        return total + account.balance;
      }
      return total;
    }, 0);
  }

  addAccount({
    name,
    balance,
    type,
  }) {
    const account = {
      transactionIds: [],
      id: util.getId(name),
      balance,
      type,
      name,
    };
    this.data.accounts.push(account);

    return account;
  }

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
  }
}

export default new Project();
