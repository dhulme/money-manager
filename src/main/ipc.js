import { ipcMain, dialog } from 'electron';
const fs = require('fs-extra');

import defaultProject from './default-project.json';
import settings from './settings';
import project from './project';

const filters = [
  {
    name: 'JSON',
    extensions: ['json']
  }
];

async function saveAs(data) {
  return new Promise(resolve => {
    dialog.showSaveDialog(
      {
        filters
      },
      async path => {
        if (!path) {
          return;
        }

        if (!path.endsWith('.json')) {
          path += '.json';
        }

        settings.setProjectPath(path);
        settings.save();

        await project.save(path, data);
        resolve();
      }
    );
  });
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

ipcMain.on('projectOpenDefault', async event => {
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

ipcMain.on('projectOpen', event => {
  dialog.showOpenDialog(
    {
      filters
    },
    async ([projectPath = null] = []) => {
      if (!projectPath) return;

      settings.setProjectPath(projectPath);
      settings.save();

      const data = await project.open(projectPath);
      event.sender.send('projectOpened', data);
    }
  );
});

ipcMain.on('projectNew', event => {
  settings.setProjectPath(null);
  settings.save();
  event.sender.send('projectOpened', defaultProject);
});

ipcMain.on('exportCsv', (event, { type, data }) => {
  dialog.showSaveDialog(
    {
      filters: [
        {
          name: 'CSV',
          extensions: ['csv']
        }
      ],
      title: `Export ${type} CSV`
    },
    path => {
      if (!path) {
        return;
      }

      if (!path.endsWith('.csv')) {
        path += '.csv';
      }

      project.exportCsv(path, data);
    }
  );
});

ipcMain.on('showCloseWarning', (event, data) => {
  dialog.showMessageBox(
    {
      type: 'warning',
      title: 'Money Manager',
      buttons: ['Save', "Don't save"],
      message: 'Do you want to save changes to your project?'
    },
    async response => {
      if (response === 0) {
        await save(data);
        event.sender.send('closeConfirmed');
      } else {
        event.sender.send('closeConfirmed');
      }
    }
  );
});

ipcMain.on('importTransactions', (event, format) => {
  console.log('data', format);
  dialog.showOpenDialog(
    { filters: [{ name: 'CSV', extensions: ['csv'] }] },
    async ([csvPath = null] = []) => {
      if (!csvPath) {
        return;
      }

      const data = await fs.readFile(csvPath);
      event.sender.send('importTransactionsDone', {
        data: data.toString(),
        format
      });
    }
  );
});
