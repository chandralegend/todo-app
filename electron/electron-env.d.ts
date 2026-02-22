/**
 * Type declarations for the Electron preload API
 * exposed via contextBridge.exposeInMainWorld("electronAPI", ...)
 */
interface ElectronAPI {
  platform: NodeJS.Platform;
  getVersion: () => Promise<string>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
