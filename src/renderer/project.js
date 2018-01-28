import example from '../example.json';

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
          const data = JSON.parse(loadedData);
          resolve(data);
        }
      });
    });
  },

  save(data) {
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
};

export default project;
