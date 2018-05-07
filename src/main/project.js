const fs = require('fs-extra');

const project = {
  async save(path, data) {
    console.log(typeof data);
    return fs.writeJson(path, data).catch(() => {
      throw new Error('Failed to save project');
    });
  },

  async open(path) {
    return fs.readJson(path).catch(() => {
      throw new Error('Failed to open project');
    });
  },
};

export default project;
