import { contextBridge, ipcRenderer } from "electron";

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Platform detection
  platform: process.platform,

  // App version
  getVersion: () => ipcRenderer.invoke("get-app-version"),

  // Window controls (for custom titlebar if needed)
  minimize: () => ipcRenderer.send("window-minimize"),
  maximize: () => ipcRenderer.send("window-maximize"),
  close: () => ipcRenderer.send("window-close"),
});
