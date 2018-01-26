const electron = require('electron');

const ipc = {
  send(channel, data) {
    return electron.ipcRenderer.send(channel, data);
  },

  setTitle(title = 'Money Manager') {
    ipc.send('setWindowTitle', title);
  },
};

export default ipc;
