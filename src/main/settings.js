const {
  app
} = require('electron');
const path = require('path');
const fs = require('fs-extra');

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

const defaultSettings = {
  projectPath: null,
};

let data;

const settings = {
  load() {
    const loadedSettings = fs.readJsonSync(settingsPath, { throws: false });
    data = loadedSettings || defaultSettings;
  },

  save() {
    return fs.writeJsonSync(settingsPath, data);
  },

  getProjectPath() {
    return data.projectPath;
  },

  setProjectPath(projectPath) {
    data.projectPath = projectPath;
  },
};

settings.load();

export default settings;
