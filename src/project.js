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
    return this.data.accounts.budgets;
  }

  accounts() {
    return this.data.accounts;
  }

  assets() {
    return this.data.accounts.assets;
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
}

export default new Project();
