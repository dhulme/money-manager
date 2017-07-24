const fs = require('fs-extra');

module.exports = {
  load(done) {
    fs.readFile(`${__dirname}/project.json`, done);
  },
};
