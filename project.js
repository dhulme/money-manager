const fs = require('fs-extra');

module.exports = {
  load(done) {
    fs.readJson(`${__dirname}/project.json`, (err, project) => {
      if (err) {
        fs.readJson(`${__dirname}/project-template.json`, done);
      } else {
        done(null, project);
      }
    });
  },

  save(projectString, done) {
    fs.writeFile(`${__dirname}/project.json`, projectString, done);
  },
};
