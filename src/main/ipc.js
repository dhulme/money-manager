import { ipcMain, dialog, Menu } from 'electron';
const fs = require('fs-extra');

import defaultProject from './default-project.json';
import settings from './settings';
import project from './project';

const filters = [
  {
    name: 'JSON',
    extensions: ['json'],
  },
];

async function saveAs(data) {
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

async function save(data) {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    await project.save(projectPath, data);
  } else {
    await saveAs(data);
  }
}

ipcMain.on('projectSave', async (event, data) => {
  save(data);
});

ipcMain.on('projectSaveAs', async (event, data) => {
  saveAs(data);
});

ipcMain.on('projectOpenDefault', async (event) => {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    try {
      const data = await project.open(projectPath);
      event.sender.send('projectOpened', data || defaultProject);
    } catch (e) {
      settings.setProjectPath(null);
      event.sender.send('projectOpened', defaultProject);
    }
  } else {
    console.log('Opening default project');
    event.sender.send('projectOpened', defaultProject);
  }
});

ipcMain.on('projectOpen', async (event) => {
  const { filePaths, canceled } = await dialog.showOpenDialog({
    filters,
  });

  if (!filePaths || !filePaths[0] || canceled) return;

  settings.setProjectPath(filePaths[0]);
  settings.save();

  const data = await project.open(filePaths[0]);
  event.sender.send('projectOpened', data);
});

ipcMain.on('projectNew', (event) => {
  settings.setProjectPath(null);
  settings.save();
  event.sender.send('projectOpened', defaultProject);
});

ipcMain.on('exportCsv', async (event, { type, data }) => {
  const { cancelled, filePath } = await dialog.showSaveDialog({
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

ipcMain.on('showCloseWarning', async (event, data) => {
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

ipcMain.handle('importTransactions', async (event, { extensions, id }) => {
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

function addApplicationMenuClickEvents(template, event) {
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
ipcMain.handle('setApplicationMenu', async (event, menuTemplate) => {
  addApplicationMenuClickEvents(menuTemplate, event);
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
});

ipcMain.handle('getSettings', () => {
  return settings.get();
});

ipcMain.handle('saveSettings', (event, data) => {
  settings.set(data);
  return settings.save();
});
