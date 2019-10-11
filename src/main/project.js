const fs = require('fs-extra');

const project = {
  async save(path, data) {
    if (typeof data !== 'string') {
      throw new Error('Project must be stringified on client');
    }
    return fs.writeFile(path, data).catch(() => {
      throw new Error('Failed to save project');
    });
  },

  async open(path) {
    console.log(`Opening project ${path}`);
    return fs.readJson(path).catch(() => {
      throw new Error('Failed to open project');
    });
  },

  async exportCsv(path, data) {
    return fs.writeFile(path, data).catch(() => {
      throw new Error('Failed to export');
    });
  }
};

export default project;
