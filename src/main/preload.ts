import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  send: ipcRenderer.send, //(channel: string, data: any) => ipcRenderer.send(channel, data),
  on: ipcRenderer.on, //(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on(channel, listener),
  invoke: ipcRenderer.invoke,
});
