const electron = require('electron');

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

// electron.ipcRenderer.on('close', () => {
//   console.log('test');
// })

const ipc = {
  send(channel, data) {
    return electron.ipcRenderer.send(channel, data);
  },

  on(channel, callback) {
    return electron.ipcRenderer.on(channel, callback);
  },

  invoke(channel, data) {
    return electron.ipcRenderer.invoke(channel, data);
  },

  setTitle(title = defaultTitle) {
    currentTitle = title;
    ipc.updateTitle();
  },

  updateTitle() {
    ipc.send('setWindowTitle', stateEdited ? `${currentTitle}*` : currentTitle);
  },

  setEdited(edited) {
    stateEdited = edited;
    ipc.updateTitle();
  },

  openProject() {
    ipc.send('projectOpen');
  },

  openDefaultProject() {
    ipc.send('projectOpenDefault');
  },

  newProject() {
    ipc.send('projectNew');
  },

  initMenu(data) {
    ipc.send('menuInit', data);
  },

  saveProject(data) {
    ipc.send('projectSave', JSON.stringify(data));
  },

  saveProjectAs(data) {
    ipc.send('projectSaveAs', JSON.stringify(data));
  },

  exportCsv(type, data) {
    ipc.send('exportCsv', { type, data });
  },

  showCloseWarning(data) {
    ipc.send('showCloseWarning', JSON.stringify(data));
  },

  importTransactions(format) {
    ipc.send('importTransactions', format);
  },

  setApplicationMenu(menuTemplate) {
    return ipc.invoke('setApplicationMenu', menuTemplate);
  }
};

export default ipc;
