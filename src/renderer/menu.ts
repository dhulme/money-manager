import ipc from './ipc';
import { MenuItemConstructorOptions } from 'electron';

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

const menuTemplate: MenuItemConstructorOptions[] = [
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
if (import.meta.env.DEV) {
  menuTemplate.push({
    label: 'Development',
    submenu: [
      {
        label: 'Toggle dev tools',
        role: 'toggleDevTools',
      },
    ],
  });
}

export function init(clickHandlers: Record<string, () => void>) {
  ipc.on('runApplicationMenuItem', (event: string, id: string) => {
    clickHandlers[id]?.();
  });
}

export function setUndoLabel(label?: string) {
  undoMenuItemTemplate.label = label ? `Undo '${label}'` : 'Undo';
  undoMenuItemTemplate.enabled = Boolean(label);
  ipc.setApplicationMenu(menuTemplate);
}

export function setRedoLabel(label?: string) {
  redoMenuItemTemplate.label = label ? `Redo '${label}'` : 'Redo';
  redoMenuItemTemplate.enabled = Boolean(label);
  ipc.setApplicationMenu(menuTemplate);
}

export function setSaveEnabled(enabled: boolean) {
  saveMenuItemTemplate.enabled = enabled;
  ipc.setApplicationMenu(menuTemplate);
}
