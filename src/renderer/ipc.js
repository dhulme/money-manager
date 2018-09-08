const electron = require('electron');

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

const ipc = {
  send(channel, data) {
    return electron.ipcRenderer.send(channel, data);
  },

  on(channel, callback) {
    return electron.ipcRenderer.on(channel, callback);
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

  exportSummaryCsv(data) {
    ipc.send('exportSummaryCsv', data);
  }
};

export default ipc;
