/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  send: (channel: string, data: any) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronApi;
  }
}
