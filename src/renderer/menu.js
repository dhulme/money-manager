import { remote } from 'electron';

const newMenuItemTemplate = {
  label: 'New',
};
const openMenuItemTemplate = {
  label: 'Open',
  accelerator: 'CmdOrCtrl+O',
};
const saveMenuItemTemplate = {
  label: 'Save',
  accelerator: 'CmdOrCtrl+S',
};
const saveAsMenuItemTemplate = {
  label: 'Save as',
  accelerator: 'CmdOrCtrl+Shift+S',
};
const undoMenuItemTemplate = {
  label: 'Undo',
  accelerator: 'CmdOrCtrl+Z',
};
const redoMenuItemTemplate = {
  label: 'Redo',
  accelerator: 'CmdOrCtrl+Y',
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
    ],
  },
  {
    label: 'Edit',
    submenu: [
      undoMenuItemTemplate,
      redoMenuItemTemplate,
    ],
  },
  {
    label: 'Development',
    submenu: [
      {
        label: 'Toggle dev tools',
        role: 'toggledevtools',
      },
    ],
  },
];

function updateMenu() {
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
  }) {
    newMenuItemTemplate.click = newClick;
    openMenuItemTemplate.click = openClick;
    saveMenuItemTemplate.click = saveClick;
    saveAsMenuItemTemplate.click = saveAsClick;
    undoMenuItemTemplate.click = undoClick;
    redoMenuItemTemplate.click = redoClick;
    updateMenu();
  },

  updateUndoLabel(label) {
    undoMenuItemTemplate.label = `Undo '${label}'`;
    updateMenu();
  },

  updateRedoLabel(label) {
    redoMenuItemTemplate.label = `Redo '${label}'`;
    updateMenu();
  },
};
