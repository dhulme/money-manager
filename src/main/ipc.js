import { ipcMain, dialog } from 'electron';

import defaultProject from './default-project.json';
import settings from './settings';
import project from './project';

const filters = [{
  name: 'JSON',
  extensions: ['json'],
}];

function saveAs(data) {
  dialog.showSaveDialog({
    filters,
  }, (path) => {
    settings.setProjectPath(path);
    settings.save();

    project.save(path, data);
  });
}

ipcMain.on('projectSave', async (event, data) => {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    project.save(projectPath, data);
  } else {
    saveAs();
  }
});

ipcMain.on('projectSaveAs', async (event, data) => {
  saveAs(data);
});

ipcMain.on('projectOpenDefault', async (event) => {
  const projectPath = settings.getProjectPath();
  if (projectPath) {
    const data = await project.open(projectPath);
    event.sender.send('projectOpened', data || defaultProject);
  } else {
    event.sender.send('projectOpened', defaultProject);
  }
});

ipcMain.on('projectOpen', (event) => {
  dialog.showOpenDialog({
    filters,
  }, async ([projectPath = null] = []) => {
    if (!projectPath) return;

    settings.setProjectPath(projectPath);
    settings.save();

    const data = await project.open(projectPath);
    event.sender.send('projectOpened', data);
  });
});

ipcMain.on('projectNew', (event) => {
  settings.setProjectPath(null);
  settings.save();
  event.sender.send('projectOpened', defaultProject);
});
