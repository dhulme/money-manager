const fs = require('fs-extra');
const path = require('path');

const root = path.resolve(__dirname, '../../');

module.exports = {
  load(done) {
    fs.readFile(`${root}/project.json`, (err, project) => {
      if (err) {
        fs.readFile(`${root}/project-template.json`, done);
      } else {
        done(null, project);
      }
    });
  },

  save(projectString, done) {
    fs.writeFile(`${root}/project.json`, projectString, done);
  },
};
