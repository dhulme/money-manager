const electron = require('electron');

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

const ipc = {
  send(channel, data) {
    return electron.ipcRenderer.send(channel, data);
  },

  setTitle(title = defaultTitle) {
    currentTitle = title;
    ipc.updateTitle();
  },

  updateTitle() {
    ipc.send('setWindowTitle', stateEdited ? `${currentTitle}*` : currentTitle);
  },

  setEdited() {
    stateEdited = true;
    ipc.updateTitle();
  },

  setSaved() {
    stateEdited = false;
    ipc.updateTitle();
  },
};

export default ipc;
