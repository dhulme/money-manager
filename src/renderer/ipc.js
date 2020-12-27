import { ipcRenderer } from 'electron';

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

const ipc = {
  send(channel, data) {
    return ipcRenderer.send(channel, data);
  },

  on(channel, callback) {
    return ipcRenderer.on(channel, callback);
  },

  invoke(channel, data) {
    return ipcRenderer.invoke(channel, data);
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

  importTransactions({ extensions, id }) {
    return ipc.invoke('importTransactions', { extensions, id });
  },

  getSettings() {
    return ipc.invoke('getSettings');
  },

  saveSettings(data) {
    return ipc.invoke('saveSettings', data);
  },

  importBulkTransactionTransactions() {
    return ipc.invoke('importBulkTransactionTransactions');
  },

  setApplicationMenu(menuTemplate) {
    return ipc.invoke('setApplicationMenu', menuTemplate);
  },
};

export default ipc;
