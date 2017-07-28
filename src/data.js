import example from '../example.json';

class Data {
  constructor() {
    this.data = {};
    
    if (window.require) {
      this.remote = require('electron').remote.require('./data');
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
        resolve(data);
      });
    });
  }
}

export default new Data();
