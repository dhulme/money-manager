import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import type { IpcSendChannel, IpcInvokeChannel, IpcOnChannel, ElectronAPI } from '../types/ipc';

const sendChannels: IpcSendChannel[] = [
  'projectSave',
  'projectSaveAs',
  'projectOpenDefault',
  'projectOpen',
  'projectNew',
  'exportCsv',
  'showCloseWarning',
  'setWindowTitle',
];

const invokeChannels: IpcInvokeChannel[] = [
  'importTransactions',
  'importBulkTransactionTransactions',
  'setApplicationMenu',
  'getSettings',
  'saveSettings',
];

const onChannels: IpcOnChannel[] = [
  'projectOpened',
  'closeConfirmed',
  'importTransactionsDone',
  'runApplicationMenuItem',
];

const api = {
  send(channel: IpcSendChannel, data?: unknown) {
    if (sendChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  invoke(channel: IpcInvokeChannel, data?: unknown) {
    if (invokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid invoke channel: ${channel}`));
  },

  on(channel: IpcOnChannel, callback: (...args: unknown[]) => void) {
    if (onChannels.includes(channel)) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => { ipcRenderer.removeListener(channel, subscription); };
    }
    return undefined;
  },
} satisfies ElectronAPI;

contextBridge.exposeInMainWorld('electronAPI', api);
