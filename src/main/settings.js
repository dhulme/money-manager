const { app } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

const defaultSettings = {
  projectPath: null,
  lastBackupDates: {},
  currencyPrefix: '£',
  dateFormat: 'DD/MM/YYYY'
};

let data;

const settings = {
  load() {
    const loadedSettings = fs.readJsonSync(settingsPath, { throws: false });
    // Merge non existing default settings into loaded settings
    data =
      {
        ...defaultSettings,
        ...loadedSettings
      } || defaultSettings;
  },

  save() {
    return fs.writeJson(settingsPath, data);
  },

  getProjectPath() {
    return data.projectPath;
  },

  setProjectPath(projectPath) {
    data.projectPath = projectPath;
  },

  setLastBackupDate(projectPath, date) {
    data.lastBackupDates[projectPath] = date;
  },

  getLastBackupDate(projectPath) {
    const date = data.lastBackupDates[projectPath];
    return date ? moment(date) : null;
  },

  get() {
    return data;
  },

  set(newData) {
    data = newData;
  }
};

settings.load();

export default settings;
