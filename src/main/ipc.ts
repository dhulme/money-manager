import { ipcMain, dialog, Menu, type IpcMainEvent, type IpcMainInvokeEvent, type MenuItemConstructorOptions } from 'electron';
import fs from 'fs-extra';

import defaultProject from './default-project.json';
import settings from './settings';
import project from './project';
import type { ProjectData } from '../types/project';
import type { Settings } from '../types/settings';

const filters = [
  {
    name: 'JSON',
    extensions: ['json'],
  },
];

async function saveAs(data: string) {
  const defaultPath = settings.getProjectPath();
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters,
    ...(defaultPath && { defaultPath }),
  });
  if (canceled || !filePath) {
    return;
  }
  let path = filePath;

  if (!path.endsWith('.json')) {
    path += '.json';
  }

  settings.setProjectPath(path);
  settings.save();

  await project.save(path, data);
}

async function save(data: string) {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    await project.save(projectPath, data);
  } else {
    await saveAs(data);
  }
}

ipcMain.on('projectSave', async (_event: IpcMainEvent, data: string) => {
  save(data);
});

ipcMain.on('projectSaveAs', async (_event: IpcMainEvent, data: string) => {
  saveAs(data);
});

ipcMain.on('projectOpenDefault', async (event: IpcMainEvent) => {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    try {
      const data = await project.open(projectPath);
      event.sender.send('projectOpened', data || defaultProject);
    } catch {
      settings.setProjectPath(null);
      event.sender.send('projectOpened', defaultProject);
    }
  } else {
    console.log('Opening default project');
    event.sender.send('projectOpened', defaultProject);
  }
});

ipcMain.on('projectOpen', async (event: IpcMainEvent) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    filters,
  });

  if (!filePaths || !filePaths[0] || canceled) return;

  settings.setProjectPath(filePaths[0]);
  settings.save();

  const data = await project.open(filePaths[0]);
  event.sender.send('projectOpened', data);
});

ipcMain.on('projectNew', (event: IpcMainEvent) => {
  settings.setProjectPath(null);
  settings.save();
  event.sender.send('projectOpened', defaultProject);
});

ipcMain.on('exportCsv', async (_event: IpcMainEvent, { type, data }: { type: string; data: string }) => {
  const { canceled: cancelled, filePath } = await dialog.showSaveDialog({
    filters: [
      {
        name: 'CSV',
        extensions: ['csv'],
      },
    ],
    title: `Export ${type} CSV`,
  });
  if (cancelled || !filePath) {
    return;
  }
  let path = filePath;

  if (!path.endsWith('.csv')) {
    path += '.csv';
  }

  project.exportCsv(path, data);
});

ipcMain.on('showCloseWarning', async (event: IpcMainEvent, data: string) => {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    title: 'Money Manager',
    buttons: ['Save', "Don't save"],
    message: 'Do you want to save changes to your project?',
  });
  if (response === 0) {
    await save(data);
  } else if (response === 1) {
    event.sender.send('closeConfirmed');
  }
});

ipcMain.handle('importTransactions', async (event: IpcMainInvokeEvent, { extensions, id }: { extensions: string[]; id: string }) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    filters: [{ name: 'Transaction files', extensions }],
  });
  if (!filePaths.length || !filePaths[0] || canceled) {
    return;
  }

  const data = await fs.readFile(filePaths[0]);
  event.sender.send('importTransactionsDone', {
    data: data.toString(),
    id,
  });
});

interface MenuTemplateItem extends MenuItemConstructorOptions {
  id?: string;
  submenu?: MenuTemplateItem[];
}

function addApplicationMenuClickEvents(template: MenuTemplateItem[], event: IpcMainInvokeEvent) {
  template.forEach((item) => {
    if (item.id) {
      item.click = () => {
        event.sender.send('runApplicationMenuItem', item.id);
      };
    }
    if (item.submenu) {
      addApplicationMenuClickEvents(item.submenu, event);
    }
  });
}
ipcMain.handle('setApplicationMenu', async (event: IpcMainInvokeEvent, menuTemplate: MenuTemplateItem[]) => {
  addApplicationMenuClickEvents(menuTemplate, event);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

ipcMain.handle('getSettings', () => {
  return settings.get();
});

ipcMain.handle('saveSettings', (_event: IpcMainInvokeEvent, data: Settings) => {
  settings.set(data);
  return settings.save();
});
