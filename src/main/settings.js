import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';

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
    return date ? new Date(date) : null;
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
