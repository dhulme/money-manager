const fs = require('fs-extra');
const moment = require('moment');

import settings from './settings';
import defaultProject from './default-project.json';

function backup(path, data) {
  const date = settings.getLastBackupDate(path);
  if (!date || moment().isAfter(date.add(1, 'months'))) {
    const date = moment().format('YYYY-MM-DD');
    return fs
      .writeFile(path.replace('.json', '') + ` [${date} backup].json`, data)
      .catch(() => {
        throw new Error('Failed to backup project');
      })
      .then(() => {
        settings.setLastBackupDate(path, moment());
      });
  }
}

const project = {
  async save(path, data) {
    if (typeof data !== 'string') {
      throw new Error('Project must be stringified on client');
    }
    backup(path, data);

    return fs.writeFile(path, data).catch(() => {
      throw new Error('Failed to save project');
    });
  },

  async open(path) {
    console.log(`Opening project ${path}`);
    try {
      const data = await fs.readJson(path);
      // accountCategories were introduced in v1.3.0
      if (!data.accountCategories) {
        data.accountCategories = defaultProject.accountCategories;
      }
      return data;
    } catch (e) {
      throw new Error('Failed to open project');
    }
  },

  async exportCsv(path, data) {
    return fs.writeFile(path, data).catch(() => {
      throw new Error('Failed to export');
    });
  }
};

export default project;
