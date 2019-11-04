import { remote } from 'electron';

const newMenuItemTemplate = {
  label: 'New',
  accelerator: 'CmdOrCtrl+Shift+N'
};
const openMenuItemTemplate = {
  label: 'Open',
  accelerator: 'CmdOrCtrl+O'
};
const saveMenuItemTemplate = {
  label: 'Save',
  accelerator: 'CmdOrCtrl+S',
  enabled: false
};
const saveAsMenuItemTemplate = {
  label: 'Save as',
  accelerator: 'CmdOrCtrl+Shift+S'
};
const undoMenuItemTemplate = {
  label: 'Undo',
  accelerator: 'CmdOrCtrl+Z',
  enabled: false
};
const redoMenuItemTemplate = {
  label: 'Redo',
  accelerator: 'CmdOrCtrl+Y',
  enabled: false
};
const settingsMenuItemTemplate = {
  label: 'Preferences',
  accelerator: 'CmdOrCtrl+,'
};
const exportSummaryMenuItemTemplate = {
  label: 'Summary as CSV'
};
const exportTransactionsMenuItemTemplate = {
  label: 'Transactions as CSV'
};
const aboutMenuItemTemplate = {
  label: 'About'
};

let menu;
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      newMenuItemTemplate,
      openMenuItemTemplate,
      saveMenuItemTemplate,
      saveAsMenuItemTemplate,
      {
        label: 'Exit',
        role: 'quit',
        accelerator: 'CmdOrCtrl+Q'
      }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      undoMenuItemTemplate,
      redoMenuItemTemplate,
      { type: 'separator' },
      settingsMenuItemTemplate
    ]
  },
  {
    label: 'Export',
    submenu: [exportSummaryMenuItemTemplate, exportTransactionsMenuItemTemplate]
  },
  {
    label: 'Help',
    submenu: [aboutMenuItemTemplate]
  }
];
if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'Development',
    submenu: [
      {
        label: 'Toggle dev tools',
        role: 'toggledevtools'
      }
    ]
  });
}

function refreshMenu() {
  if (menu) menu.destroy();
  menu = remote.Menu.buildFromTemplate(menuTemplate);
  remote.Menu.setApplicationMenu(menu);
}

export default {
  init({
    openClick,
    saveClick,
    undoClick,
    redoClick,
    saveAsClick,
    newClick,
    exportSummaryClick,
    exportTransactionsClick,
    aboutClick,
    settingsClick
  }) {
    newMenuItemTemplate.click = newClick;
    openMenuItemTemplate.click = openClick;
    saveMenuItemTemplate.click = saveClick;
    saveAsMenuItemTemplate.click = saveAsClick;
    undoMenuItemTemplate.click = undoClick;
    redoMenuItemTemplate.click = redoClick;
    exportSummaryMenuItemTemplate.click = exportSummaryClick;
    exportTransactionsMenuItemTemplate.click = exportTransactionsClick;
    aboutMenuItemTemplate.click = aboutClick;
    settingsMenuItemTemplate.click = settingsClick;
    refreshMenu();
  },

  setUndoLabel(label) {
    undoMenuItemTemplate.label = label ? `Undo '${label}'` : 'Undo';
    undoMenuItemTemplate.enabled = Boolean(label);
    refreshMenu();
  },

  setRedoLabel(label) {
    redoMenuItemTemplate.label = label ? `Redo '${label}'` : 'Redo';
    redoMenuItemTemplate.enabled = Boolean(label);
    refreshMenu();
  },

  setSaveEnabled(enabled) {
    saveMenuItemTemplate.enabled = enabled;
    refreshMenu();
  }
};
