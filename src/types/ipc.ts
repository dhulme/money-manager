import type { ProjectData } from './project';
import type { Settings } from './settings';

// Channels for fire-and-forget messages (renderer → main)
export type IpcSendChannel =
  | 'projectSave'
  | 'projectSaveAs'
  | 'projectOpenDefault'
  | 'projectOpen'
  | 'projectNew'
  | 'exportCsv'
  | 'showCloseWarning'
  | 'setWindowTitle';

// Channels for request/response (renderer → main → renderer)
export type IpcInvokeChannel =
  | 'importTransactions'
  | 'importBulkTransactionTransactions'
  | 'setApplicationMenu'
  | 'getSettings'
  | 'saveSettings';

// Channels for events (main → renderer)
export type IpcOnChannel =
  | 'projectOpened'
  | 'closeConfirmed'
  | 'importTransactionsDone'
  | 'runApplicationMenuItem';

export interface ElectronAPI {
  send(channel: IpcSendChannel, data?: unknown): void;
  invoke(channel: 'getSettings'): Promise<Settings>;
  invoke(channel: 'saveSettings', data: Settings): Promise<void>;
  invoke(channel: 'importTransactions', data: { extensions: string[]; id: string }): Promise<void>;
  invoke(channel: 'importBulkTransactionTransactions'): Promise<string>;
  invoke(channel: 'setApplicationMenu', data: unknown): Promise<void>;
  invoke(channel: IpcInvokeChannel, data?: unknown): Promise<unknown>;
  on(channel: IpcOnChannel, callback: (...args: unknown[]) => void): (() => void) | undefined;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
