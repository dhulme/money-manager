// import { ipcRenderer } from 'electron';

import { Project, Settings } from '../types';

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

const ipc = {
  send(channel: string, data?: any) {
    return window.electronAPI.send(channel, data);
  },

  on(channel: string, callback: any) {
    return window.electronAPI.on(channel, callback);
  },

  invoke(channel: string, data?: any) {
    return window.electronAPI.invoke(channel, data);
  },

  setTitle(title = defaultTitle) {
    currentTitle = title;
    ipc.updateTitle();
  },

  updateTitle() {
    ipc.send('setWindowTitle', stateEdited ? `${currentTitle}*` : currentTitle);
  },

  setEdited(edited: boolean) {
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

  saveProject(data: any) {
    ipc.send('projectSave', JSON.stringify(data));
  },

  saveProjectAs(data: any) {
    ipc.send('projectSaveAs', JSON.stringify(data));
  },

  exportCsv(type: any, data: any) {
    ipc.send('exportCsv', { type, data });
  },

  showCloseWarning(data: any) {
    ipc.send('showCloseWarning', JSON.stringify(data));
  },

  importTransactions({ extensions, id }: { extensions: string[]; id: string }) {
    return ipc.invoke('importTransactions', { extensions, id });
  },

  getSettings(): Settings {
    return ipc.invoke('getSettings');
  },

  saveSettings(data: any) {
    return ipc.invoke('saveSettings', data);
  },

  importBulkTransactionTransactions() {
    return ipc.invoke('importBulkTransactionTransactions');
  },

  setApplicationMenu(menuTemplate: any) {
    return ipc.invoke('setApplicationMenu', menuTemplate);
  },

  onProjectOpened(callback: (project: Project) => void) {
    ipc.on('projectOpened', (event: any, data: Project) => callback(data));
  },
};

export default ipc;
