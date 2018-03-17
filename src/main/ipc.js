const fs = require('fs-extra');
const path = require('path');
const electron = require('electron');

const root = path.resolve(__dirname, '../../');

electron.ipcMain.on('projectOpen', (event) => {
  fs.readFile('D:/Documents/Money/project.json', (err, project) => {
    event.sender.send('projectOpened', JSON.parse(project));
  });
});
