"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electronAPI", {
  // Fire-and-forget: renderer → main
  send(channel, data) {
    const allowedChannels = [
      "projectSave",
      "projectSaveAs",
      "projectOpenDefault",
      "projectOpen",
      "projectNew",
      "exportCsv",
      "showCloseWarning",
      "setWindowTitle"
    ];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  // Request/response: renderer → main → renderer
  invoke(channel, data) {
    const allowedChannels = [
      "importTransactions",
      "importBulkTransactionTransactions",
      "setApplicationMenu",
      "getSettings",
      "saveSettings"
    ];
    if (allowedChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  // Listen: main → renderer
  on(channel, callback) {
    const allowedChannels = [
      "projectOpened",
      "closeConfirmed",
      "importTransactionsDone",
      "runApplicationMenuItem"
    ];
    if (allowedChannels.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  }
});
