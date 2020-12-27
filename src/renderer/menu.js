import ipc from './ipc';

const undoMenuItemTemplate = {
  label: 'Undo',
  accelerator: 'CmdOrCtrl+Z',
  enabled: false,
  id: 'editUndo',
};

const redoMenuItemTemplate = {
  label: 'Redo',
  accelerator: 'CmdOrCtrl+Y',
  enabled: false,
  id: 'editRedo',
};

const saveMenuItemTemplate = {
  label: 'Save',
  accelerator: 'CmdOrCtrl+S',
  enabled: false,
  id: 'fileSave',
};

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New',
        accelerator: 'CmdOrCtrl+Shift+N',
        id: 'fileNew',
      },
      {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        id: 'fileOpen',
      },
      saveMenuItemTemplate,
      {
        label: 'Save as',
        accelerator: 'CmdOrCtrl+Shift+S',
        id: 'fileSaveAs',
      },
      {
        label: 'Exit',
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q',
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      undoMenuItemTemplate,
      redoMenuItemTemplate,
      { type: 'separator' },
      {
        label: 'Preferences',
        accelerator: 'CmdOrCtrl+,',
        id: 'editSettings',
      },
      {
        label: 'Add account category',
        id: 'editNewAccountCategory',
      },
    ],
  },
  {
    label: 'Export',
    submenu: [
      {
        label: 'Summary as CSV',
        id: 'exportSummary',
      },
      {
        label: 'Transactions as CSV',
        id: 'exportTransactions',
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About',
        id: 'helpAbout',
      },
    ],
  },
];
if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'Development',
    submenu: [
      {
        label: 'Toggle dev tools',
        role: 'toggledevtools',
      },
    ],
  });
}

export function init(clickHandlers) {
  ipc.on('runApplicationMenuItem', (event, id) => {
    clickHandlers[id]?.();
  });
}

export function setUndoLabel(label) {
  undoMenuItemTemplate.label = label ? `Undo '${label}'` : 'Undo';
  undoMenuItemTemplate.enabled = Boolean(label);
  ipc.setApplicationMenu(menuTemplate);
}

export function setRedoLabel(label) {
  redoMenuItemTemplate.label = label ? `Redo '${label}'` : 'Redo';
  redoMenuItemTemplate.enabled = Boolean(label);
  ipc.setApplicationMenu(menuTemplate);
}

export function setSaveEnabled(enabled) {
  saveMenuItemTemplate.enabled = enabled;
  ipc.setApplicationMenu(menuTemplate);
}
