import type { IpcSendChannel, IpcOnChannel } from '../types/ipc';

const defaultTitle = 'Money Manager';
let stateEdited = false;
let currentTitle = '';

const ipc = {
  send(channel: IpcSendChannel, data?: unknown) {
    return window.electronAPI.send(channel, data);
  },

  on(channel: IpcOnChannel, callback: (...args: unknown[]) => void) {
    return window.electronAPI.on(channel, callback);
  },

  invoke(channel: string, data?: unknown): Promise<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window.electronAPI as any).invoke(channel, data);
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

  saveProject(data: unknown) {
    ipc.send('projectSave', JSON.stringify(data));
  },

  saveProjectAs(data: unknown) {
    ipc.send('projectSaveAs', JSON.stringify(data));
  },

  exportCsv(type: string, data: string) {
    ipc.send('exportCsv', { type, data });
  },

  showCloseWarning(data: unknown) {
    ipc.send('showCloseWarning', JSON.stringify(data));
  },

  importTransactions({ extensions, id }: { extensions: string[]; id: string }) {
    return ipc.invoke('importTransactions', { extensions, id });
  },

  getSettings() {
    return ipc.invoke('getSettings');
  },

  saveSettings(data: unknown) {
    return ipc.invoke('saveSettings', data);
  },

  importBulkTransactionTransactions() {
    return ipc.invoke('importBulkTransactionTransactions');
  },

  setApplicationMenu(menuTemplate: unknown) {
    return ipc.invoke('setApplicationMenu', menuTemplate);
  },
};

export default ipc;
