import example from '../example.json';

class Project {
  constructor() {
    this.data = {};
    
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
    return this.data.budgets;
  }

  accounts() {
    return this.data.accounts;
  }

  budget(id) {
    return this.data.budgets.find(budget => budget.id === id);
  }
}

export default new Project();
