const remote = require('electron').remote;

const saveMenuItemTemplate = {
  label: 'Save',
};
const undoMenuItemTemplate = {
  label: 'Undo',
};
const redoMenuItemTemplate = {
  label: 'Redo',
};

let menu;
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      saveMenuItemTemplate,
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
    saveClick,
    undoClick,
    redoClick,
  }) {
    saveMenuItemTemplate.click = saveClick;
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
