const fs = require('fs-extra');
const path = require('path');
const electron = require('electron');
const ipcMain = electron.ipcMain;

const root = path.resolve(__dirname, '../../');

ipcMain.on('projectOpen', (event) => {
  fs.readFile('D:/Documents/Money/project.json', (err, project) => {
    event.sender.send('projectOpened', JSON.parse(project));
  });
});

ipcMain.on('projectSave', (event, data) => {
  fs.writeFile('D:/Documents/Money/project.json', data, (err) => {
    if (err) {
      throw new Error('Failed to save project');
    }
  });
});