import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import type { Settings } from '../types/settings';

const userDataPath = app.getPath('userData');
const settingsPath = path.join(userDataPath, 'settings.json');

const defaultSettings: Settings = {
  projectPath: null,
  lastBackupDates: {},
  currencyPrefix: '£',
  dateFormat: 'dd/MM/yyyy',
  importTransactionsDescriptionsGiftAided: []
};

let data: Settings;

const settings = {
  load() {
    const loadedSettings = fs.readJsonSync(settingsPath, { throws: false }) as Partial<Settings> | null;
    data = {
      ...defaultSettings,
      ...loadedSettings
    };
  },

  save() {
    return fs.writeJson(settingsPath, data);
  },

  getProjectPath(): string | null {
    return data.projectPath;
  },

  setProjectPath(projectPath: string | null) {
    data.projectPath = projectPath;
  },

  setLastBackupDate(projectPath: string, date: Date) {
    data.lastBackupDates[projectPath] = date.toISOString();
  },

  getLastBackupDate(projectPath: string): Date | null {
    const date = data.lastBackupDates[projectPath];
    return date ? new Date(date) : null;
  },

  get(): Settings {
    return data;
  },

  set(newData: Settings) {
    data = newData;
  }
};

settings.load();

export default settings;
