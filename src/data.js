class Data {
  constructor() {
    this.remote = require('electron').remote.require('./data');
  }

  load() {
    return new Promise((resolve) => {
      this.remote.load((err, data) => {
        resolve(data);
      });
    });
  }
}

export default new Data();
