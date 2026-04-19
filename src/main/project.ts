import fs from 'fs-extra';
import { differenceInMonths, format } from 'date-fns';

import settings from './settings';
import defaultProject from './default-project.json';
import type { ProjectData } from '../types/project';

function backup(filePath: string, data: string) {
  const lastBackup = settings.getLastBackupDate(filePath);
  if (!lastBackup || differenceInMonths(new Date(), lastBackup) >= 1) {
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    return fs
      .writeFile(filePath.replace('.json', '') + ` [${dateStr} backup].json`, data)
      .catch(() => {
        throw new Error('Failed to backup project');
      })
      .then(() => {
        settings.setLastBackupDate(filePath, new Date());
      });
  }
}

const project = {
  async save(filePath: string, data: string) {
    if (typeof data !== 'string') {
      throw new Error('Project must be stringified on client');
    }
    backup(filePath, data);

    return fs.writeFile(filePath, data).catch(() => {
      throw new Error('Failed to save project');
    });
  },

  async open(filePath: string): Promise<ProjectData> {
    console.log(`Opening project ${filePath}`);
    try {
      const data = await fs.readJson(filePath) as ProjectData;
      if (!data.accountCategories) {
        data.accountCategories = defaultProject.accountCategories as ProjectData['accountCategories'];
      }
      return data;
    } catch {
      throw new Error('Failed to open project');
    }
  },

  async exportCsv(filePath: string, data: string) {
    return fs.writeFile(filePath, data).catch(() => {
      throw new Error('Failed to export');
    });
  }
};

export default project;
