"use strict";
const electron = require("electron");
const sendChannels = [
  "projectSave",
  "projectSaveAs",
  "projectOpenDefault",
  "projectOpen",
  "projectNew",
  "exportCsv",
  "showCloseWarning",
  "setWindowTitle"
];
const invokeChannels = [
  "importTransactions",
  "importBulkTransactionTransactions",
  "setApplicationMenu",
  "getSettings",
  "saveSettings"
];
const onChannels = [
  "projectOpened",
  "closeConfirmed",
  "importTransactionsDone",
  "runApplicationMenuItem"
];
const api = {
  send(channel, data) {
    if (sendChannels.includes(channel)) {
      electron.ipcRenderer.send(channel, data);
    }
  },
  invoke(channel, data) {
    if (invokeChannels.includes(channel)) {
      return electron.ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid invoke channel: ${channel}`));
  },
  on(channel, callback) {
    if (onChannels.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      electron.ipcRenderer.on(channel, subscription);
      return () => {
        electron.ipcRenderer.removeListener(channel, subscription);
      };
    }
    return void 0;
  }
};
electron.contextBridge.exposeInMainWorld("electronAPI", api);
